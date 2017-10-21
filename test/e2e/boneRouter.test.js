const db = require('./db');
const request = require('./request');
const mongoose = require('mongoose');
const {assert} = require('chai');
const Bone = require('../../lib/models/Bone');

describe('boneRouter: ', () => {

    let humerusInput = null;
    let calcanealInput = null;
    let sphenoidInput = null;
    beforeEach(() => {
        mongoose.connection.dropDatabase();

        humerusInput = {
            name: 'humerus',
            type: 'long',
            joints: ['glenohumeral', 'ulnohumeral', 'humeroradial'],
            muscles: ['deltoid', 'supraspinatus', 'pectoralis major', 'teres major', 'latissimus dorsi', 'infraspinatus', 'teres minor', 'subscapularis', 'biceps brachii', 'brachialis', 'brachioradialis', 'triceps brachii', 'anconeous'],
            nerves: ['axillary', 'radial', 'ulnar']
        };
        calcanealInput = {
            name: 'calcaneal',
            type: 'short',
            joints: ['talocalcaneal', 'talocalcaneonavicular', 'calcaneocuboid'],
            muscles: ['gastrocnemius', 'soleus', 'plantaris', 'extensor digitorum brevis', 'abductor hallucis', 'extensor hallucis brevis', 'abductor digiti minimi', 'flexor digitorum brevis', 'quadratus plantae'],
            nerves: ['sural', 'tibial']
        };
        sphenoidInput = {
            name: 'sphenoid',
            type: 'irregular',
            joints: ['sphenoemthmoidal', 'sphenosquamosal', 'sphenopetrosal', 'palatomaxillary'],
            muscles: ['lateral pterygoid', 'medial pterygoid', 'levator palpebrae superioris', 'superior rectus', 'inferior rectus', 'medial rectus', 'lateral rectus', 'superior oblique', 'tensor tympani', 'tensor veli palatini'],
            nerves: ['optic', 'opthalmic', 'maxillary', 'mandibular', 'abductent', 'oculomotor', 'trochlear', 'petrosal', 'pharyngeal']
        };
    });

    describe('GET', () => {
        it('returns all items in the database as an array', () => {
            const saveAll = [
                request.post('/api/bones').send(humerusInput),
                request.post('/api/bones').send(calcanealInput),
                request.post('/api/bones').send(sphenoidInput)
            ];
            return Promise.all(saveAll)
                .then(savedData => {
                    savedData = savedData.map(res => res.body);
                    return request.get('/api/bones')
                        .then(gottenData => {
                            const gotten = gottenData.body;
                            assert.deepInclude(gotten, savedData[0]);
                            assert.deepInclude(gotten, savedData[1]);
                            assert.deepInclude(gotten, savedData[2]);
                        });
                });
        });
    });
    describe('GET:id', () => {
        it('gets an object by its id', () => {
            return request.post('/api/bones')
                .send(sphenoidInput)
                .then(res => {
                    res = res.body;
                    return request.get(`/api/bones/${res._id}`)
                        .then(gotten => {
                            assert.deepEqual(gotten.body, res);
                        });
                });
        });
        
        it('returns 404 if id does not exist', () => {
            return request.post('/api/bones')
                .send(sphenoidInput)
                .then(() => {
                    return request.get('/api/bones/++badId++')
                        .catch(err => {
                            assert.equal(err.status, 404);
                        });
                });

        });
    });
    describe('POST', () => {
        it('returns the posted object with its mongodb _id', () => {
            return request.post('/api/bones')
                .send(humerusInput)
                .then(res => {
                    assert.ok(res.body._id);
                });
        });

        it('returns errors when the posted object is invalid', () => {
            delete humerusInput.name;
            return request.post('/api/bones')
                .send(humerusInput)
                .catch(err => {
                    assert.equal(err.response.body.error[0], 'Path `name` is required.');
                });
        });
    });
    describe('DELETE:id', () => {
        it('removes the object with the given id', () => {
            return request.post('/api/bones')
                .send(calcanealInput)
                .then(saved => {
                    saved = saved.body;
                    return request.del(`/api/bones/${saved._id}`)
                        .then(status => {
                            assert.deepEqual(status.body, {removed: true});
                            return request.get(`/api/bones/${saved._id}`)
                                .catch(err => {
                                    assert.equal(err.status, 404);
                                });
                        });
                });
        });

        it('returns {removed false} when given a bad id', () => {
            return request.del('/api/bones/<+++blah+++>')
                .then(status => assert.deepEqual(status.body, {removed: false}));
        });
    });
    describe('PUT:id', () => {
        it('updates the bone with the given id', () => {
            return request.post('/api/bones')
                .send(sphenoid)
                .then(saved => {
                    saved = saved.body;
                    sphenoid.name = 'da best, yo';
                    return request.put(`/api/bones/${saved._id}`)
                        .send(sphenoid)
                        .then(updated => {
                            assert.deepEqual(updated.body, sphenoid);
                        });
                })
        });
    });
});