import { Response } from "express";

export const errorResponse = (code: number, error: any, res: Response) => {
  if (process.env.NODE_ENV === "development")
    if (error instanceof Error) console.log(error.stack);
    else console.log(error);
  
  if (code !== 500 && typeof error === "string")
    /*return */res.status(code).json({
      message: error,
    });
  else if (code !== 500 && error instanceof Error) {
    /*return */res.status(code).json({
      message: error.message,
    });
  } else {
    /*if (process.env.NODE_ENV === "development")
      if (error instanceof Error) console.log(error.stack);
      else console.log(error);*/

    /*return */res.status(code).json({
      message: "Internal server error has occured",
      error: error.message ? error.message : "",
    });
  }
};
