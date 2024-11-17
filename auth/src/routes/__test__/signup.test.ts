import request from "supertest";
import {app} from "../../app";


describe('signup route', () => {
    it('Should return a 201 on successful signup', async () => {
        return await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201)
    });

    it('Should return 400 with an invalid email', async () => {
        return await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@testcom',
                password: 'password',
            })
            .expect(400)
    });

    it('Should return 400 with an invalid password', async () => {
        return await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'p',
            })
            .expect(400)
    });

    it('Should return 400 when there is not a password field', async () => {
        return await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                passwor: 'password',
            })
            .expect(400)
    });

    it('Should return 400 when there is not an email field', async () => {
        return await request(app)
            .post('/api/users/signup')
            .send({
                password: 'password',
            })
            .expect(400)
    });

    it('Should disallow duplicate emails', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            }).expect(201)

        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password2',
            })
            .expect(400)

    });

    it('Should set a cookie after successful signup', async () => {

        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201)

        expect(response.get('Set-Cookie')).toBeDefined();

    })


});

