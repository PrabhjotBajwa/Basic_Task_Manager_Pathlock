using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactAppPolicy",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Your React app's URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("ReactAppPolicy");

// --- In-Memory Data Store ---
var tasks = new ConcurrentDictionary<Guid, TaskItem>();

// Seed with some sample data
var sampleId1 = Guid.NewGuid();
var sampleId2 = Guid.NewGuid();
tasks.TryAdd(sampleId1, new TaskItem { Id = sampleId1, Description = "Build backend API", IsCompleted = true });
tasks.TryAdd(sampleId2, new TaskItem { Id = sampleId2, Description = "Build React frontend", IsCompleted = false });


// --- API Endpoints ---

// GET /api/tasks
app.MapGet("/api/tasks", () =>
{
    return Results.Ok(tasks.Values.OrderBy(t => t.Description));
});

// POST /api/tasks
app.MapPost("/api/tasks", ([FromBody] CreateTaskRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Description))
    {
        return Results.BadRequest("Description is required.");
    }

    var task = new TaskItem
    {
        Id = Guid.NewGuid(),
        Description = request.Description,
        IsCompleted = false
    };

    tasks.TryAdd(task.Id, task);

    return Results.Created($"/api/tasks/{task.Id}", task);
});

// PUT /api/tasks/{id} (Toggles completion)
app.MapPut("/api/tasks/{id}", (Guid id) =>
{
    if (!tasks.TryGetValue(id, out var task))
    {
        return Results.NotFound();
    }

    task.IsCompleted = !task.IsCompleted;
    tasks[id] = task; // Update the dictionary
    
    return Results.Ok(task);
});

// DELETE /api/tasks/{id}
app.MapDelete("/api/tasks/{id}", (Guid id) =>
{
    if (!tasks.TryRemove(id, out _))
    {
        return Results.NotFound();
    }

    return Results.NoContent();
});

app.Run();

// --- Models ---
public class TaskItem
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public bool IsCompleted { get; set; }
}

public class CreateTaskRequest
{
    public string Description { get; set; }
}