const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository id' });
  }

  return next();
}

function repositoriesExists(request, response, next) {
  if (repositories.length > 0) {
    return next();
  }

  return response.status(400).json({ error: 'Must exists one or more repositories' });
}

app.use('/repositories/:id', validateRepositoryId, repositoriesExists);

app.get("/repositories", (request, response) => {
  return response.send(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.send(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    response.status(400).send({ error: 'Repository not found' });
  }

  const repository = repositories[repositoryIndex];

  const { title, url, techs } = request.body;
  const newRepository = {
    id: repository.id,
    title,
    url,
    techs,
    likes: repository.likes
  };

  repositories[repositoryIndex] = newRepository;
  return response.send(newRepository);  
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    response.status(400).send({ error: 'Repository not found' });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    response.status(400).send({ error: 'Repository not found' });
  }

  const repository = repositories[repositoryIndex];
  repositories[repositoryIndex].likes = repository.likes + 1;

  response.send(repositories[repositoryIndex]);
});

module.exports = app;
