const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(400).json({
      error: "User not found"
    })
  }

  request.username = user.username;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const exists = users.some(user => user.username === username);
  if (exists) {
    return response.status(400).json({
      error: "User already exists"
    })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = users.find(user => user.username === username);
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const user = users.find(user => user.username === username);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (todo) {
    Object.assign(todo, { title, deadline: new Date(deadline) });
    return response.status(201).json(todo);
  } else {
    return response.status(400).json({
      error: "Todo not found"
    });
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (todo) {
    Object.assign(todo, { done: true });
    return response.status(201).send();
  } else {
    return response.status(400).json({
      error: "Todo not found"
    });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (todo) {
    user.todos.splice(todo, 1);
    return response.status(201).send();
  } else {
    return response.status(404).json({
      error: 'Todo not found'
    });
  }
});

module.exports = app;