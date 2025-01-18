"use server";

import { timeEntryService } from "@/services/TimeEntryService";

export const getUserTimeEntries = async (userId: string) => {
  const data = await timeEntryService.getUserTimeEntries(userId);
  if (data) {
    return { success: "Time entries fetched successfully", data };
  } else {
    return { error: "Failed to fetch time entries" };
  }
};

export const clockIn = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.clockIn(userId, departmentId);
  if (data) {
    return { success: "Clocked in successfully", data };
  } else {
    return { error: "Failed to clock in" };
  }
};

export const clockOut = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.clockOut(userId, timeEntryId);
  if (data) {
    return { success: "Clocked out successfully", data };
  } else {
    return { error: "Failed to clock out" };
  }
};

export const approveTimeEntry = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.approveTimeEntry(userId, timeEntryId);
  if (data) {
    return { success: "Time entry approved successfully", data };
  } else {
    return { error: "Failed to approve time entry" };
  }
};

export const discardTimeEntry = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.discardTimeEntry(userId, timeEntryId);
  if (data) {
    return { success: "Time entry discarded successfully", data };
  } else {
    return { error: "Failed to discard time entry" };
  }
};

export const approveAllWeeklyTimeEntries = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.approveAllWeeklyTimeEntries(userId, departmentId);
  if (data) {
    return { success: "All weekly time entries approved successfully", data };
  } else {
    return { error: "Failed to approve all weekly time entries" };
  }
};

export const getWeeklyReport = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.getWeeklyReport(userId, departmentId);
  if (data) {
    return { success: "Weekly report fetched successfully", data };
  } else {
    return { error: "Failed to fetch weekly report" };
  }
};

export const isUserClockedIn = async (userId: string) => {
  const data = await timeEntryService.isUserClockedIn(userId);
  if (data) {
    return { success: "User is clocked in", data };
  } else {
    return { error: "User is not clocked in" };
  }
};

export const getActiveTimeEntry = async (userId: string) => {
  const data = await timeEntryService.getActiveTimeEntry(userId);
  if (data) {
    return { success: "Active time entry fetched successfully", data };
  } else {
    return { error: "Failed to fetch active time entry" };
  }
}