import { NextFunction, Request, Response } from "express";
import db from "../../db";

export const computeIdentity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      res.status(400).send({
        status: 400,
        message:
          "Please provide a value for at-least one of the email or phone number",
      });
      return;
    }

    email = email || null;
    phoneNumber = phoneNumber || null;

    // get grouped data for given email and phoneNumber
    const { rows } = await db.query(
      `SELECT "linkPrecedence", count(id), min(id) as "oldestId", min("linkedId") as "oldestLinkedId" from "contact" where  ${
        email && phoneNumber
          ? `"email" = $1 OR "phoneNumber" = $2`
          : email
          ? `"email" = $1`
          : phoneNumber
          ? `"phoneNumber" = $1`
          : ""
      } group by "linkPrecedence"`,
      email && phoneNumber ? [email, phoneNumber] : [email || phoneNumber]
    );

    const primaryRow = rows.find((item) => item.linkPrecedence === "primary");
    const secondaryRow = rows.find(
      (item) => item.linkPrecedence === "secondary"
    );
    const primaryCount = Number(primaryRow?.count || 0);
    const secondaryCount = Number(secondaryRow?.count || 0);

    let finalOldestId = -1;

    // create if no data exists
    if (primaryCount === 0 && secondaryCount === 0) {
      try {
        await db.query(
          `INSERT INTO "contact" ("email", "phoneNumber", "linkPrecedence") VALUES ($1, $2, $3)`,
          [email, phoneNumber, "primary"]
        );
      } catch (error) {
        console.log(error);
        res.status(400).send({
          status: 400,
          message: "Make sure the given combination does not already exist",
        });
        return;
      }
      const {
        rows: [newlyCreatedRow],
      } = await db.query(`SELECT max(id) as id from "contact"`);
      const newlyCreatedId = newlyCreatedRow.id;

      res.send({
        contact: {
          primaryContactId: newlyCreatedId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
      return;
    }

    // create a secondary contact if a primary contact exist or link with the primary of secondary contact found
    if (primaryCount === 1 || (primaryCount === 0 && secondaryCount >= 1)) {
      const linkedId =
        primaryCount && secondaryCount === 0
          ? primaryRow.oldestId
          : primaryCount && secondaryCount
          ? Math.min(primaryRow.oldestId, secondaryRow.oldestLinkedId)
          : secondaryRow.oldestLinkedId;

      try {
        if (email && phoneNumber) {
          await db.query(
            `INSERT INTO "contact" ("email", "phoneNumber", "linkPrecedence", "linkedId") VALUES ($1, $2, $3, $4)`,
            [email, phoneNumber, "secondary", linkedId]
          );
        }
      } catch (error) {
        console.log(error);
        res.status(400).send({
          status: 400,
          message: "Make sure the given combination does not already exist",
        });
        return;
      }
      finalOldestId = linkedId;
    }

    // update all other contacts to secondary except the oldest contact if multiple primary contacts found
    if (primaryCount > 1) {
      const oldestId =
        primaryCount && secondaryCount
          ? Math.min(primaryRow.oldestId, secondaryRow.oldestLinkedId)
          : primaryRow.oldestId;
      await db.query(
        `update "contact" set "linkPrecedence" = 'secondary', "linkedId" = $3, "updatedAt" = NOW() where ("email" = $1 OR "phoneNumber" = $2) AND id != $3`,
        [email, phoneNumber, oldestId]
      );
      finalOldestId = oldestId;
    }

    if (finalOldestId !== -1) {
      const { rows: allRows } = await db.query(
        `with t as (SELECT * from "contact" where id = $1 OR "linkedId" = $1)
          select json_build_object(
            'emails', ARRAY(
              select distinct "email" from t where "email" is not null
            ),
            'phoneNumbers', ARRAY(
              select distinct "phoneNumber" from t where "phoneNumber" is not null
            ),
            'secondaryContactIds', ARRAY(
              select id from t where "linkPrecedence" = 'secondary'
            )
          ) as data
          `,
        [finalOldestId]
      );

      const data = allRows[0].data;
      const { emails, phoneNumbers, secondaryContactIds } = data;

      res.send({
        contact: {
          primaryContactId: finalOldestId,
          emails,
          phoneNumbers,
          secondaryContactIds,
        },
      });
      return;
    }

    res.send({
      contact: {
        primaryContactId: -1,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: -1,
      },
    });
  } catch (error) {
    next(error);
  }
};
