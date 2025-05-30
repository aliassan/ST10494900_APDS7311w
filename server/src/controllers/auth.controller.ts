import { Request, Response } from "express";
// import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import * as utils from "../utils";
import { prisma } from "../utils";
import crypto from "crypto";
import bcrypt from "bcrypt";

// export const authenticateSiwe = async (req: Request, res: Response) => {
//   try {
//     //Get authentication and user data from request body
//     const { message, signature } = req.body;

//     //Check if authentication and user data exists
//     if (!message) return errorResponse(401, "Auth error: Missing message", res);

//     if (!signature)
//       return errorResponse(401, "Auth error: Missing signature", res);

//     let { address, nonce } = extractAddressAndNonce(message);

//     //Get nonce from user data from database
//     const user = await prisma.user.findUnique({
//       where: { address },
//     });

//     nonce = user ? user.nonce : nonce;

//     //Very the data
//     const SIWEObject = new SiweMessage(message);

//     try {
//       await SIWEObject.verify({ signature, nonce });
//     } catch (error) {
//       return errorResponse(401, (error as any).error.type, res);
//     }

//     //Update nonce for user and persist in database
//     nonce = generateNonce();

//     if (user)
//       await prisma.user.update({
//         where: { address },
//         data: { nonce },
//       });
//     else
//       await prisma.user.create({
//         data: {
//           address,
//           nonce,
//         },
//       });

//     await prisma.$disconnect();

//     //Create JWT for the user and send to the fron-end
//     const secretKey = process.env.SECRET_KEY as string;
//     const accessToken = jwt.sign({ address }, secretKey, { expiresIn: "24h" });

//     return res.status(200).json({
//       accessToken,
//     });
//   } catch (error) {
//     return errorResponse(500, error, res);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

export const authenticateUser = async (req: Request, res: Response) => {
  try {
    //Get authentication and user data from request body
    const { accountNumber, password } = req.body;

    //Check if authentication and user data exists
    if (!accountNumber)
      return utils.errorResponse(401, "Get user error: Missing user address", res);

    console.log(`Getting user "${accountNumber}"...`);
    console.log(`User encrypted account number: ${utils.encryptWithAES(accountNumber)}`);

    const user = await prisma.user.findUnique({
      where: {
        accountNumber: /*crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")*/ accountNumber,
      },
    });

    if (!user) return utils.errorResponse(404, "User not found", res);

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return utils.errorResponse(401, "Invalid password", res);
    }

    const decryptedUser = {
      id: user.id,
      fullName: user.fullName,
      accountNumber: accountNumber,
      idNumber: utils.decryptWithAES( user.idNumber ),
      isEmployee: user.isEmployee,
    }

    console.log("User found: ", decryptedUser);

    //Create JWT with 15m expiry for the user and send to the fron-end
    const secretKey = process.env.SECRET_KEY as string;
    const authToken = jwt.sign({ accountNumber, userId: user.id }, secretKey, { expiresIn: "15m" });

    res.status(200).json({
      ...decryptedUser,
      authToken,
    });
  } catch (error) {
    return utils.errorResponse(500, error, res);
  } finally {
    await prisma.$disconnect();
  }
}

export const authenticateToken = (req: Request, res: Response) => {
  try {
    if (!(req as any).address) {
      return utils.errorResponse(401, "Unauthorized: Missing jwt payload", res);
    }

    /*return */res.status(200).json({});
  } catch (error) {
    return utils.errorResponse(500, error, res);
  }
};
