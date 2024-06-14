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
      vechicles,
      tractorAndTrolly,
      transformer,
    } = req.body;
    try {
      if (!building || !waterTank || !tubeWell || !furnitureAndFixture || !officeEquipment || !computerEquipment || !armsAndAmmuntion || !vechicles || !tractorAndTrolly || !transformer) {
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
        vechicles: vechicles,
        tractorAndTrolly: tractorAndTrolly,
        transformer:transformer,
      });
      await operatingFixedAssets.save();
      res.status(200).json({
        message: "OperatingFixedAssets created successfully",
        operatingFixedAssets: operatingFixedAssets,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
  
}