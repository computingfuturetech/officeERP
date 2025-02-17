const OperatingFixedAssets = require("../../models/operatingFixedAssetsModels/operatingFixedAssets");

module.exports = {
  createOpertingFixedAssets: async (req, res) => {
    const {
      building,
      waterTank,
      tubeWell,
      furnitureAndFixture,
      officeEquipment,
      computerEquipment,
      armsAndAmmuntion,
      vehicles,
      tractorAndTrolly,
      transformer,
      machinery,
    } = req.body;
    try {
      if (
        !building ||
        !waterTank ||
        !tubeWell ||
        !furnitureAndFixture ||
        !officeEquipment ||
        !computerEquipment ||
        !armsAndAmmuntion ||
        !vehicles ||
        !tractorAndTrolly ||
        !transformer ||
        !machinery
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const operatingFixedAssets = new OperatingFixedAssets({
        building: building,
        waterTank: waterTank,
        tubeWell: tubeWell,
        furnitureAndFixture: furnitureAndFixture,
        officeEquipment: officeEquipment,
        computerEquipment: computerEquipment,
        armsAndAmmuntion: armsAndAmmuntion,
        vehicles: vehicles,
        tractorAndTrolly: tractorAndTrolly,
        transformer: transformer,
        machinery: machinery,
      });
      await operatingFixedAssets.save();
      res.status(200).json({
        message: "Operating Fixed Assets created successfully",
        operatingFixedAssets: operatingFixedAssets,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateOperatingFixedAssets: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const {
        building,
        waterTank,
        tubeWell,
        furnitureAndFixture,
        officeEquipment,
        computerEquipment,
        armsAndAmmuntion,
        vehicles,
        tractorAndTrolly,
        transformer,
        machinery,
      } = req.body;

      const operatingFixedAssets = await OperatingFixedAssets.findById(id);
      if (!operatingFixedAssets) {
        return res
          .status(404)
          .json({ message: "Operating Fixed Assets Record not found" });
      }

      if (building !== undefined) {
        operatingFixedAssets.building =
          (operatingFixedAssets.building || 0) + Number(building);
      }
      if (waterTank !== undefined) {
        operatingFixedAssets.waterTank =
          (operatingFixedAssets.waterTank || 0) + Number(waterTank);
      }
      if (tubeWell !== undefined) {
        operatingFixedAssets.tubeWell =
          (operatingFixedAssets.tubeWell || 0) + Number(tubeWell);
      }
      if (furnitureAndFixture !== undefined) {
        operatingFixedAssets.furnitureAndFixture =
          (operatingFixedAssets.furnitureAndFixture || 0) +
          Number(furnitureAndFixture);
      }
      if (officeEquipment !== undefined) {
        operatingFixedAssets.officeEquipment =
          (operatingFixedAssets.officeEquipment || 0) +
          Number(officeEquipment);
      }
      if (computerEquipment !== undefined) {
        operatingFixedAssets.computerEquipment =
          (operatingFixedAssets.computerEquipment || 0) +
          Number(computerEquipment);
      }
      if (armsAndAmmuntion !== undefined) {
        operatingFixedAssets.armsAndAmmuntion =
          (operatingFixedAssets.armsAndAmmuntion || 0) +
          Number(armsAndAmmuntion);
      }
      if (vehicles !== undefined) {
        operatingFixedAssets.vehicles =
          (operatingFixedAssets.vehicles || 0) + Number(vehicles);
      }
      if (tractorAndTrolly !== undefined) {
        operatingFixedAssets.tractorAndTrolly =
          (operatingFixedAssets.tractorAndTrolly || 0) +
          Number(tractorAndTrolly);
      }
      if (transformer !== undefined) {
        operatingFixedAssets.transformer =
          (operatingFixedAssets.transformer || 0) +
          Number(transformer);
      }
      if (machinery !== undefined) {
        operatingFixedAssets.machinery =
          (operatingFixedAssets.machinery || 0) + Number(machinery);
      }
      await operatingFixedAssets.save();
      res.status(200).json({
        message: "Operating Fixed Assets record updated successfully",
        operatingFixedAssets: operatingFixedAssets,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
