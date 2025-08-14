// /cron/biddingCron.js
import cron from "node-cron";
import BiddingSession from "../Models/BiddingSession.js";
import ProductRequest from "../Models/ProductRequest.js";
import { acceptHighestBid } from "../Controllers/ProductRequestRoute.js";

cron.schedule("*/1 * * * *", async () => {
  console.log("Checking bidding sessions...");
  const now = new Date();

  const sessions = await BiddingSession.find({ isCompleted: false });

  for (const session of sessions) {
    const expireTime = new Date(session.startedAt.getTime() + session.biddingDuration * 60000);
    const diffMinutes = Math.floor((now.getTime() - session.startedAt.getTime()) / 60000);

    console.log({
      productId: session.productId,
      now: now.toISOString(),
      startedAt: session.startedAt.toISOString(),
      expireTime: expireTime.toISOString(),
      biddingDuration: session.biddingDuration,
      diffMinutes
    });

    // Only close if we've actually reached/exceeded the duration
    if (diffMinutes >= session.biddingDuration) {
      try {
        const req = await ProductRequest.findOne({ "product._id": session.productId });
        if (!req) {
          console.warn(`No matching ProductRequest found for product ${session.productId}`);
          continue;
        }

        const fakeReq = {
          query: { reqId: req._id },
          currUser: { _id: req.owner._id.toString() }
        };
        const fakeRes = { status: () => ({ send: () => {}, json: () => {} }) };

        await acceptHighestBid.controller(fakeReq, fakeRes);
        await BiddingSession.updateOne({ _id: session._id }, { isCompleted: true });

        console.log(`✅ Bidding session resolved for product: ${session.productId}`);
      } catch (e) {
        console.error("❌ Error resolving bidding:", e);
      }
    } else {
      console.log(`⏳ Bidding still active for product ${session.productId} (${diffMinutes}/${session.biddingDuration} mins)`);
    }
  }
});
