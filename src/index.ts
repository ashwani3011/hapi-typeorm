import { User } from "./entity/User";
import { createConnection } from "typeorm";
import * as Hapi from "@hapi/hapi";
import { getRepository } from "typeorm";
import { Server, Request, ResponseToolkit } from "hapi";

interface NewUser {
  firstName: string;
  lastName: string;
  age: number;
}
createConnection({
  type: "mysql",
  database: "typeormpractice",
  username: "root",
  password: "password",
  logging: false,
  synchronize: true,
  entities: [User],
});

const init = async () => {
  const server: Server = Hapi.Server({
    host: "localhost",
    port: 5000,
  });

  // GET - Read

  server.route({
    method: "GET",
    path: "/allUsers",
    handler: async (request: Request, reply: ResponseToolkit) => {
      const allUser = await getRepository(User).find();

      return reply
        .response({
          status: "success",
          data: {
            users: allUser,
          },
        })
        .code(200);
    },
  });

  // POST - Write

  server.route({
    method: "POST",
    path: "/allUsers",
    handler: async (request: Request, reply: ResponseToolkit) => {
      const { firstName, lastName, age } = request.payload as NewUser;

      const newUser = new User();
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.age = age;

      const userRepo = getRepository(User);
      await userRepo.insert(newUser);

      return reply
        .response({
          status: "success",
          data: {
            user: newUser,
          },
        })
        .code(201);
    },
  });

  // PATCH - Update

  server.route({
    method: "PUT",
    path: "/allUsers/{id}",
    handler: async (request: Request, reply: ResponseToolkit) => {
      const ID = Number(request.params.id);
      const { firstName, lastName, age } = request.payload as NewUser;
      const userRepo = getRepository(User);
      const updatedUserData = { firstName, lastName, age };
      await userRepo.update(ID, updatedUserData);
      return reply
        .response({
          status: "success",
          data: {
            user: updatedUserData,
          },
        })
        .code(200);
    },
  });

  // DELETE

  server.route({
    method: "DELETE",
    path: "/allUsers/{id}",
    handler: async (request: Request, reply: ResponseToolkit) => {
      const ID = Number(request.params.id);
      const userRepo = getRepository(User);
      await userRepo.delete({ id: ID });
      return reply
        .response({
          status: "success",
          data: null,
        })
        .code(204);
    },
  });

  // unhandled routes

  server.route({
    method: ["GET", "POST"],
    path: "/{any*}",
    handler: (request: Request, reply: ResponseToolkit) => {
      return reply
        .response({
          status: "failure",
          message: "no such page found",
        })
        .code(404);
    },
  });

  await server.start();
  console.log(`Server started on: ${server.info.uri}`);
};

init()
  .then(() => console.log("server up and running"))
  .catch((err) => console.log(err));
