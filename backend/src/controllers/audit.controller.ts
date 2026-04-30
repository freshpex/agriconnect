import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { VerificationAudit } from "../models/VerificationAudit";

export const getVerificationAudits = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { userId, action, page = "1", limit = "20" } = req.query;

  const filter: Record<string, unknown> = {};
  if (userId) filter.user = userId;
  if (action) filter.action = action;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [audits, total] = await Promise.all([
    VerificationAudit.find(filter)
      .populate("user", "name phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    VerificationAudit.countDocuments(filter),
  ]);

  res.json({
    audits,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};
