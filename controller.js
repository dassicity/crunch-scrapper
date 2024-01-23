const scrapper = require('./scrapper').dataScrapper;

exports.getRouterController = async (req, res, next) => {
    try {
        const org = req.body.org;
        // console.log(req.body);
        let scrap = await scrapper(org);
        console.log(scrap);
        return res.status(200).json({
            status: "ok",
            data: scrap?.list,
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }
};