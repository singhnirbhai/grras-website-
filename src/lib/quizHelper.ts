import { Quiz } from "@/models/Quiz";
import moment from "moment-timezone";

let lastStatusUpdate = 0;

export async function updateQuizStatuses() {
  try {
    const nowMs = Date.now();
    // Only query database updates at most once every 30 seconds to throttle write load
    if (nowMs - lastStatusUpdate < 30000) {
      return;
    }
    lastStatusUpdate = nowMs;

    // Current time in IST
    const now = moment().tz("Asia/Kolkata").toDate();

    // 1. Activate quizzes: startTime <= now AND endTime > now AND not active AND not expired
    await Quiz.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gt: now },
        isActive: false,
        isExpired: false,
      },
      {
        $set: { isActive: true },
      }
    );

    // 2. Expire quizzes: endTime <= now AND not expired
    await Quiz.updateMany(
      {
        endTime: { $lte: now },
        isExpired: false,
      },
      {
        $set: {
          isActive: false,
          isExpired: true,
        },
      }
    );
  } catch (error) {
    console.error("Error updating quiz statuses dynamically:", error);
  }
}
