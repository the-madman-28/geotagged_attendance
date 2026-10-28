"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchInController = punchInController;
exports.punchOutController = punchOutController;
exports.getAttendanceHistoryController = getAttendanceHistoryController;
exports.getTodayAttendanceController = getTodayAttendanceController;
const attendance_service_1 = require("../services/attendance.service");
function validateGpsData(latitude, longitude, accuracy) {
    if (latitude === undefined ||
        longitude === undefined ||
        accuracy === undefined) {
        return "Latitude, longitude and accuracy are required";
    }
    if (typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        typeof accuracy !== "number") {
        return "Latitude, longitude and accuracy must be numbers";
    }
    if (latitude < -90 || latitude > 90) {
        return "Invalid latitude";
    }
    if (longitude < -180 || longitude > 180) {
        return "Invalid longitude";
    }
    if (accuracy < 0) {
        return "Invalid GPS accuracy";
    }
    return null;
}
async function punchInController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        const gpsError = validateGpsData(latitude, longitude, accuracy);
        if (gpsError) {
            return res.status(400).json({
                success: false,
                message: gpsError,
            });
        }
        const result = await (0, attendance_service_1.punchIn)({
            employeeId,
            latitude,
            longitude,
            accuracy,
            reason,
        });
        return res.status(201).json({
            success: true,
            message: result.status === "IN_RANGE"
                ? "Punch in successful"
                : "Punch in recorded for review",
            attendance: {
                id: result.attendance.id,
                employeeId: result.attendance.employeeId,
                workplaceId: result.attendance.workplaceId,
                punchIn: result.attendance.punchIn,
                punchInLatitude: result.attendance.punchInLatitude,
                punchInLongitude: result.attendance.punchInLongitude,
                punchInAccuracy: result.attendance.punchInAccuracy,
                punchInDistance: result.attendance.punchInDistance,
                punchInStatus: result.attendance.punchInStatus,
                punchInReason: result.attendance.punchInReason,
                autoPunchedOut: result.attendance.autoPunchedOut,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "Employee not found":
                    return res.status(401).json({
                        success: false,
                        message: "Employee not found",
                    });
                case "Employee account is inactive":
                    return res.status(403).json({
                        success: false,
                        message: "Employee account is inactive",
                    });
                case "No active workplace configured":
                    return res.status(503).json({
                        success: false,
                        message: "No active workplace configured",
                    });
                case "Reason is required when punching in outside the workplace":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                case "Attendance has already been marked for today":
                    return res.status(409).json({
                        success: false,
                        message: error.message,
                    });
            }
        }
        console.error("Punch in error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function punchOutController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        const gpsError = validateGpsData(latitude, longitude, accuracy);
        if (gpsError) {
            return res.status(400).json({
                success: false,
                message: gpsError,
            });
        }
        const result = await (0, attendance_service_1.punchOut)({
            employeeId,
            latitude,
            longitude,
            accuracy,
            reason,
        });
        return res.status(200).json({
            success: true,
            message: result.status === "IN_RANGE"
                ? "Punch out successful"
                : "Punch out recorded for review",
            attendance: {
                id: result.attendance.id,
                employeeId: result.attendance.employeeId,
                workplaceId: result.attendance.workplaceId,
                punchIn: result.attendance.punchIn,
                punchOut: result.attendance.punchOut,
                punchOutLatitude: result.attendance.punchOutLatitude,
                punchOutLongitude: result.attendance.punchOutLongitude,
                punchOutAccuracy: result.attendance.punchOutAccuracy,
                punchOutDistance: result.attendance.punchOutDistance,
                punchOutStatus: result.attendance.punchOutStatus,
                punchOutReason: result.attendance.punchOutReason,
                autoPunchedOut: result.attendance.autoPunchedOut,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "Employee not found":
                    return res.status(401).json({
                        success: false,
                        message: "Employee not found",
                    });
                case "Employee account is inactive":
                    return res.status(403).json({
                        success: false,
                        message: "Employee account is inactive",
                    });
                case "Attendance has not been marked for today":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                case "Attendance has already been punched out":
                    return res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                case "No active workplace configured":
                    return res.status(503).json({
                        success: false,
                        message: "No active workplace configured",
                    });
                case "Reason is required when punching out outside the workplace":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
            }
        }
        console.error("Punch out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
/*
 * EDIT PUNCH IN
 *
 * Only today's attendance can be edited.
 * The service layer performs the actual same-day
 * validation and GPS/workplace verification.
 */
// export async function editPunchInController(
//   req: AuthenticatedRequest,
//   res: Response
// ) {
//   try {
//     const employeeId = req.employee?.employeeId;
//     if (!employeeId) {
//       return res.status(401).json({
//         success: false,
//         message: "Employee authentication required",
//       });
//     }
//     const {
//       latitude,
//       longitude,
//       accuracy,
//       reason,
//       punchIn,
//     } = req.body;
//     const gpsError = validateGpsData(
//       latitude,
//       longitude,
//       accuracy
//     );
//     if (gpsError) {
//       return res.status(400).json({
//         success: false,
//         message: gpsError,
//       });
//     }
//     if (punchIn !== undefined) {
//       if (
//         typeof punchIn !== "string" ||
//         Number.isNaN(Date.parse(punchIn))
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid punch in time",
//         });
//       }
//     }
//     const result = await editPunchIn({
//       employeeId,
//       latitude,
//       longitude,
//       accuracy,
//       reason,
//       punchIn,
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Punch in updated successfully",
//       attendance: {
//         id: result.attendance.id,
//         employeeId: result.attendance.employeeId,
//         workplaceId: result.attendance.workplaceId,
//         attendanceDate:
//           result.attendance.attendanceDate,
//         punchIn: result.attendance.punchIn,
//         punchInLatitude:
//           result.attendance.punchInLatitude,
//         punchInLongitude:
//           result.attendance.punchInLongitude,
//         punchInAccuracy:
//           result.attendance.punchInAccuracy,
//         punchInDistance:
//           result.attendance.punchInDistance,
//         punchInStatus:
//           result.attendance.punchInStatus,
//         punchInReason:
//           result.attendance.punchInReason,
//         punchOut:
//           result.attendance.punchOut,
//         autoPunchedOut:
//           result.attendance.autoPunchedOut,
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       switch (error.message) {
//         case "Employee not found":
//           return res.status(401).json({
//             success: false,
//             message: "Employee not found",
//           });
//         case "Employee account is inactive":
//           return res.status(403).json({
//             success: false,
//             message: "Employee account is inactive",
//           });
//         case "Attendance has not been marked for today":
//           return res.status(404).json({
//             success: false,
//             message: error.message,
//           });
//         case "Attendance can only be edited on the same day":
//           return res.status(403).json({
//             success: false,
//             message: error.message,
//           });
//         case "Attendance cannot be edited after automatic punch out":
//           return res.status(403).json({
//             success: false,
//             message: error.message,
//           });
//         case "No active workplace configured":
//           return res.status(503).json({
//             success: false,
//             message: "No active workplace configured",
//           });
//         case "Reason is required when editing punch in outside the workplace":
//           return res.status(400).json({
//             success: false,
//             message: error.message,
//           });
//       }
//     }
//     console.error("Edit punch in error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// }
/*
 * EDIT PUNCH OUT
 *
 * Only today's attendance can be edited.
 * The service layer performs the actual same-day
 * validation and GPS/workplace verification.
 */
// export async function editPunchOutController(
//   req: AuthenticatedRequest,
//   res: Response
// ) {
//   try {
//     const employeeId = req.employee?.employeeId;
//     if (!employeeId) {
//       return res.status(401).json({
//         success: false,
//         message: "Employee authentication required",
//       });
//     }
//     const {
//       latitude,
//       longitude,
//       accuracy,
//       reason,
//       punchOut,
//     } = req.body;
//     const gpsError = validateGpsData(
//       latitude,
//       longitude,
//       accuracy
//     );
//     if (gpsError) {
//       return res.status(400).json({
//         success: false,
//         message: gpsError,
//       });
//     }
//     if (punchOut !== undefined) {
//       if (
//         typeof punchOut !== "string" ||
//         Number.isNaN(Date.parse(punchOut))
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid punch out time",
//         });
//       }
//     }
//     const result = await editPunchOut({
//       employeeId,
//       latitude,
//       longitude,
//       accuracy,
//       reason,
//       punchOut,
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Punch out updated successfully",
//       attendance: {
//         id: result.attendance.id,
//         employeeId: result.attendance.employeeId,
//         workplaceId: result.attendance.workplaceId,
//         attendanceDate:
//           result.attendance.attendanceDate,
//         punchIn: result.attendance.punchIn,
//         punchOut: result.attendance.punchOut,
//         punchOutLatitude:
//           result.attendance.punchOutLatitude,
//         punchOutLongitude:
//           result.attendance.punchOutLongitude,
//         punchOutAccuracy:
//           result.attendance.punchOutAccuracy,
//         punchOutDistance:
//           result.attendance.punchOutDistance,
//         punchOutStatus:
//           result.attendance.punchOutStatus,
//         punchOutReason:
//           result.attendance.punchOutReason,
//         autoPunchedOut:
//           result.attendance.autoPunchedOut,
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       switch (error.message) {
//         case "Employee not found":
//           return res.status(401).json({
//             success: false,
//             message: "Employee not found",
//           });
//         case "Employee account is inactive":
//           return res.status(403).json({
//             success: false,
//             message: "Employee account is inactive",
//           });
//         case "Attendance has not been marked for today":
//           return res.status(404).json({
//             success: false,
//             message: error.message,
//           });
//         case "Punch out has not been marked":
//           return res.status(400).json({
//             success: false,
//             message: error.message,
//           });
//         case "Attendance can only be edited on the same day":
//           return res.status(403).json({
//             success: false,
//             message: error.message,
//           });
//         case "Attendance was automatically punched out and cannot be edited":
//           return res.status(403).json({
//             success: false,
//             message: error.message,
//           });
//         case "No active workplace configured":
//           return res.status(503).json({
//             success: false,
//             message: "No active workplace configured",
//           });
//         case "Reason is required when editing punch out outside the workplace":
//           return res.status(400).json({
//             success: false,
//             message: error.message,
//           });
//       }
//     }
//     console.error("Edit punch out error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// }
async function getAttendanceHistoryController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const attendance = await (0, attendance_service_1.getAttendanceHistory)(employeeId);
        return res.status(200).json({
            success: true,
            attendance,
        });
    }
    catch (error) {
        console.error("Get attendance history error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getTodayAttendanceController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const attendance = await (0, attendance_service_1.getTodayAttendance)(employeeId);
        return res.status(200).json({
            success: true,
            attendance,
        });
    }
    catch (error) {
        console.error("Get today's attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
