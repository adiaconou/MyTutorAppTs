import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }

  // Redirect to the Google auth route if the user is not authenticated
  res.redirect('/auth/google');
};