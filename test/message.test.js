import request from 'supertest';
import express from 'express';
import { expect } from 'chai';
import messageRoutes from '../routes/messageRoutes.js';
import { clientReady } from '../services/whatsappService.js';

const app = express();
app.use(express.json());
app.use('/api/messages', messageRoutes);

describe('POST /api/messages/send', () => {
    before(async () => {
        await clientReady;
    });

    it('debería enviar un mensaje y devolver un estado 200', (done) => {
        request(app)
            .post('/api/messages/send')
            .send({ number: '123456789', message: 'Hola desde la API!' })
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('Mensaje enviado con éxito!');
                done();
            });
    });

    it('debería devolver un error 500 si no se envía el número', (done) => {
        request(app)
            .post('/api/messages/send')
            .send({ message: 'Hola desde la API!' })
            .expect('Content-Type', /json/)
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.error).to.equal('Error al enviar el mensaje');
                done();
            });
    });
});

describe('GET /api/messages/check/:number', () => {
    before(async () => {
        await clientReady;
    });

    it('debería devolver true si el número es un cliente de WhatsApp', (done) => {
        request(app)
            .get('/api/messages/check/123456789')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.isRegistered).to.be.a('boolean');
                done();
            });
    });

    it('debería devolver false si el número no es un cliente de WhatsApp', (done) => {
        request(app)
            .get('/api/messages/check/987654321')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.isRegistered).to.be.a('boolean');
                done();
            });
    });
});
