import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API de Agendamento",
        version: "1.0",
        description: `Esta API, desenvolvida com Next.js, permite o gerenciamento completo de agendamentos para profissionais da saúde, oferecendo funcionalidades para criar, listar e gerenciar horários disponíveis, agendamentos e usuários.
                      Ela oferece um sistema de autenticação via token JWT, com diferentes níveis de acesso para profissionais, pacientes e administradores.
                      A API também permite a criação de novos profissionais, recuperação de senhas e comunicação com os usuários através de e-mails automatizados para recuperação de acesso.`,
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};