import { Router } from "express";
import { BloodInventory } from "../models/BloodInventory.js";

const router = Router();

router.get("/inventory-summary", async (_req, res) => {
  const grouped = await BloodInventory.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        unitsAvailable: { $sum: "$unitsAvailable" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const items = grouped.map((g) => ({ bloodGroup: g._id, unitsAvailable: g.unitsAvailable }));
  res.json({ items });
});

export default router;
