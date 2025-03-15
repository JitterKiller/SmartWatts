import { spawn } from "child_process";
import path from "path";

export async function POST(req) {
  try {
    const { num_rooms, num_people, housearea, is_ac, is_tv } = await req.json();

    const scriptPath = path.join(process.cwd(), "model/predict.py");

    const pythonProcess = spawn("python3", [
      scriptPath,
      num_rooms,
      num_people,
      housearea,
      is_ac,
      is_tv,
    ]);

    return new Promise((resolve) => {
      pythonProcess.stdout.on("data", (data) => {
        resolve(new Response(JSON.stringify({ prediction: data.toString().trim() }), { status: 200 }));
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data}`);
        resolve(new Response(JSON.stringify({ error: "Prediction failed" }), { status: 500 }));
      });
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
