import { NextFunction, Request, Response } from "express";
import db from "../../db";

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rows } = await db.query(`SELECT * from "contact" order by id`);

    res.send({
      status: 200,
      rows,
    });
  } catch (error) {
    next(error);
  }
};
