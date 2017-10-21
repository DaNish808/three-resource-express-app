const {Router} = require('express');
const router = Router();
const Bone = require('../models/Bone');

router
    .get('/', (req, res, next) => {
        Bone.find()
            .then(monRes => res.json(monRes))
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        Bone.findById(req.params.id)
            .then(monRes => res.send(monRes))
            .catch(next);
    })
    .post('/', (req, res, next) => {
        new Bone(req.body)
            .save()
            .then(monRes => res.send(monRes))
            .catch(next);
    })
    .delete('/:id', (req, res, next) => {
        Bone.findByIdAndRemove(req.params.id)
            .then(monRes => {
                res.send(monRes === null ? {removed:false} : {removed: true});
            })
            .catch(next);
    });

module.exports = router;