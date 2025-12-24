import type { Request, Response, RequestHandler } from "express";
import { userService } from "@/services/user.service";
import { asyncHandler } from "@/middleware";
import type { SignupInput, LoginInput } from "@/types/auth.types";
import { StatusCodes } from "http-status-codes";

export const userController = {
  signup: asyncHandler(
    async (req: Request<{}, {}, SignupInput>, res: Response): Promise<void> => {
      const authResponse = await userService.signup(req.body);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: authResponse,
      });
    }
  ) as RequestHandler,

  login: asyncHandler(
    async (req: Request<{}, {}, LoginInput>, res: Response): Promise<void> => {
      const authResponse = await userService.login(req.body);

      res.status(StatusCodes.OK).json({
        success: true,
        data: authResponse,
      });
    }
  ) as RequestHandler,

  me: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.getById(req.user!.userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  }) as RequestHandler,
};
