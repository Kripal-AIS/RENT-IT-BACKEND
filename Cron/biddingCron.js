// /cron/biddingCron.js
import cron from "node-cron";
import BiddingSession from "../Models/BiddingSession.js";
import ProductRequest from "../Models/ProductRequest.js";
import { acceptHighestBid } from "../Controllers/ProductRequestRoute.js";

cron.schedule("*/5 * * * *", async () => {
  console.log("Checking bidding sessions...");
  const now = new Date();

  const sessions = await BiddingSession.find({ isCompleted: false });

  for (const session of sessions) {
    const expireTime = new Date(session.startedAt.getTime() + session.biddingDuration * 60000);
    if (now >= expireTime) {
      const req = await ProductRequest.findOne({ "product._id": session.productId });
      if (!req) continue;

      const fakeReq = {
        query: { reqId: req._id },
        currUser: { _id: req.owner._id.toString() }
      };

      const fakeRes = { status: () => ({ send: () => {}, json: () => {} }) };

      try {
        await acceptHighestBid.controller(fakeReq, fakeRes);
        await BiddingSession.updateOne({ _id: session._id }, { isCompleted: true });
        console.log(`Bidding session resolved for product: ${session.productId}`);
      } catch (e) {
        console.error("Error resolving bidding:", e);
      }
    }
  }
});
