import Notification from "../models/Notification.js";
import { sendMail } from "./mailService.js";

/**
 * Unified Notification Service
 * Sends in-app notification and optionally an email.
 */
export const notify = async ({ recipient, title, message, type = "system", email = true }) => {
  try {
    // 1. Save in-app notification
    const notification = await Notification.create({
      recipient: recipient._id || recipient,
      title,
      message,
      type,
    });

    // 2. Opt-in email notification
    if (email && recipient.email) {
      await sendMail({
        to: recipient.email,
        subject: title,
        text: message,
      });
    }

    return notification;
  } catch (error) {
    console.error("Notification Service Error:", error);
    // Silent fail for non-critical flow
  }
};
