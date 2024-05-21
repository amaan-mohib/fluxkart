import { NextFunction, Request, Response } from "express";
import db from "../../db";

export const computeIdentity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      res.status(400).send({
        status: 400,
        message:
          "Please provide a value for at-least one of the email or phoneNumber",
      });
      return;
    }

    const { rows } = await db.query(
      `SELECT * from "contact" where  ${
        email && phoneNumber
          ? `"email" = $1 OR "phoneNumber" = $2`
          : email
          ? `"email" = $1`
          : phoneNumber
          ? `"phoneNumber" = $2`
          : ""
      }`,
      [email, phoneNumber]
    );

    if (rows.length === 0) {
      await db.query(
        `INSERT INTO "contact" ("email", "phoneNumber", "linkPrecedence") VALUES ($1, $2, $3)`,
        [email, phoneNumber, "primary"]
      );
      const {
        rows: [newlyCreatedRow],
      } = await db.query(`SELECT max(id) from "contact"`);
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
