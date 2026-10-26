import prisma from "../config/prisma";

export async function processAutomaticPunchOut() {
  const now = new Date();

  // Find all attendance records that are still open
  const openAttendances = await prisma.attendance.findMany({
    where: {
      punchOut: null,
      autoPunchedOut: false,
    },
    include: {
      workplace: true,
    },
  });

  let processedCount = 0;

  for (const attendance of openAttendances) {
    const maximumSessionHours = Number(
      attendance.workplace.maximumSessionHours
    );

    const automaticPunchOutTime = new Date(
      attendance.punchIn.getTime() +
        maximumSessionHours * 60 * 60 * 1000
    );

    // Session has reached its maximum duration
    if (now >= automaticPunchOutTime) {
      await prisma.attendance.update({
        where: {
          id: attendance.id,
        },
        data: {
          punchOut: automaticPunchOutTime,
          autoPunchedOut: true,
        },
      });

      processedCount++;
    }
  }

  return processedCount;
}