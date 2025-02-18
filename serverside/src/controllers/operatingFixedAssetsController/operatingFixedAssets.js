const { get } = require("mongoose");
const OperatingFixedAssets = require("../../models/operatingFixedAssetsModels/operatingFixedAssets");

module.exports = {
  addOperatingFixedAssetsOrUpdate: async (req, res) => {
    const {
      building,
      waterTank,
      tubeWell,
      furnitureAndFixture,
      officeEquipment,
      computerEquipment,
      armsAndAmmunition,
      vehicles,
      tractorAndTrolly,
      transformer,
      machinery,
    } = req.body;

    try {
      let operatingFixedAssets = await OperatingFixedAssets.findOne();

      if (operatingFixedAssets) {
        if (building) operatingFixedAssets.building = building;
        if (waterTank) operatingFixedAssets.waterTank = waterTank;
        if (tubeWell) operatingFixedAssets.tubeWell = tubeWell;
        if (furnitureAndFixture)
          operatingFixedAssets.furnitureAndFixture = furnitureAndFixture;
        if (officeEquipment)
          operatingFixedAssets.officeEquipment = officeEquipment;
        if (computerEquipment)
          operatingFixedAssets.computerEquipment = computerEquipment;
        if (armsAndAmmunition)
          operatingFixedAssets.armsAndAmmunition = armsAndAmmunition;
        if (vehicles) operatingFixedAssets.vehicles = vehicles;
        if (tractorAndTrolly)
          operatingFixedAssets.tractorAndTrolly = tractorAndTrolly;
        if (transformer) operatingFixedAssets.transformer = transformer;
        if (machinery) operatingFixedAssets.machinery = machinery;

        await operatingFixedAssets.save();
        return res.status(200).json({
          status: "success",
          message: "Operating Fixed Assets updated successfully",
          data: operatingFixedAssets,
        });
      }

      operatingFixedAssets = new OperatingFixedAssets({
        building,
        waterTank,
        tubeWell,
        furnitureAndFixture,
        officeEquipment,
        computerEquipment,
        armsAndAmmunition,
        vehicles,
        tractorAndTrolly,
        transformer,
        machinery,
      });

      await operatingFixedAssets.save();
      return res.status(201).json({
        status: "success",
        message: "Operating Fixed Assets created successfully",
        data: operatingFixedAssets,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
  getOperatingFixedAssets: async (req, res) => {
    try {
      const operatingFixedAssets = await OperatingFixedAssets.findOne();

      return res.status(200).json({
        status: "success",
        message: "Operating Fixed Assets fetched successfully",
        data: operatingFixedAssets,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
