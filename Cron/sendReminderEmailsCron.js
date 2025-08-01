import cron from 'node-cron';
import Agreement from '../Models/Agreement.js';
import User from '../Models/User.js';
import { sendMail } from "../Controllers/AuthController.js";
 
cron.schedule('*/2 * * * *', async () => {
   console.log("[Reminder Cron] Running...");
 
  try {
    const now = new Date();
 
    const agreements = await Agreement.find({
      isEmailReminderSent: false,
    });
 
    for (const agreement of agreements) {
      const timeDiffMs = new Date(agreement.revokedate) - now;
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);
 
      if (hoursDiff <= 24 && hoursDiff > 0) {
        const borrower = await User.findById(agreement.borrowerid);
        if (!borrower) continue;
 
        const mailContent = `Hi ${borrower.username},\n\nThis is a reminder that your rental item is due for return on ${new Date(agreement.revokedate).toDateString()}.\nPlease return it on time to avoid issues.\n\nThank you,\nRent-It Team`;
        const subject = '⏰ Rent-It Return Reminder';
 
        await sendMail(mailContent, subject, borrower);
 
        // ✅ mark reminder sent
        agreement.isEmailReminderSent = true;
        await agreement.save();
 
        console.log(`[Reminder Sent] to ${borrower.email}`);
      }
    }
  } catch (err) {
    console.error("[Reminder Cron] Error:", err);
  }
});