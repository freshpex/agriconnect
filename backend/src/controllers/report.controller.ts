import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Report } from "../models/Report";

export const createReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reporterId = req.user?.id;
  if (!reporterId) throw new ApiError("Authentication required", 401);

  const { targetType, targetId, reason, description } = req.body;

  const report = await Report.create({
    reporter: reporterId,
    targetType,
    targetId: targetId || undefined,
    reason: String(reason).trim(),
    description: description ? String(description).trim() : undefined,
  });

  res.status(201).json({ report });
};

export const getReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { status, targetType, page = "1", limit = "20" } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (targetType) filter.targetType = targetType;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate("reporter", "name phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Report.countDocuments(filter),
  ]);

  res.json({
    reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

export const updateReportStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { status, resolutionNote, assignedTo } = req.body;
  const report = await Report.findById(req.params.id);

  if (!report) throw new ApiError("Report not found", 404);

  if (status) {
    report.status = status;
    if (status === "resolved" || status === "rejected") {
      report.resolvedAt = new Date();
    }
  }

  if (resolutionNote !== undefined) {
    report.resolutionNote = String(resolutionNote).trim() || undefined;
  }

  if (assignedTo !== undefined) {
    report.assignedTo = assignedTo || undefined;
  }

  await report.save();

  res.json({ report });
};
