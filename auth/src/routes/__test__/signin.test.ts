import request from "supertest";
import {app} from "../../app";


describe('signin route', () => {

    it('Should return 400 with an invalid email', async () => {
        return await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@testcom',
                password: 'password',
            })
            .expect(400)
    });


    it('Should return 400 with if email is not signed up', async () => {
        return  await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(400, {errors: [{message: 'Invalid credentials'}]})

    });


    it('Should fail if and incorrect password is supplied', async () => {

        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201)


        return  await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: '123456',
            })
            .expect(400, {errors: [{message: 'Invalid credentials'}]})
    });


    it('Should return 200 and cookie if the user is signed in correctly', async () => {

        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(201)


        const response = await request(app)
            .post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: 'password',
            })
            .expect(200)

        expect(response.get('Set-Cookie')).toBeDefined();
        expect(response.body.id).toBeDefined();
        expect(response.body.email).toEqual('test@test.com');
    });




})