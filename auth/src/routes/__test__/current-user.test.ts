import request from "supertest";
import {app} from "../../app";


describe('current-user route', () => {

    it('Should respond with details about the current user', async ()=> {

        const cookie = await global.signup();

        const response = await request(app)
            .get('/api/users/currentuser')
            .set('Cookie', cookie)
            .send()
            .expect(200)

        expect(response.body.currentUser.email).toBe('test@test.com');
        expect(response.body.currentUser.id).toBeDefined();
        expect(response.body.currentUser.password).not.toBeDefined();

    })

    it('Should responds with null if not authenticated', async ()=> {
        const response = await request(app).get('/api/users/currentuser').send().expect(200);
        expect(response.body.currentUser).toBeNull();
    });



})