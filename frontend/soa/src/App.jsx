// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import { register } from "./esbClient";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register onSubmit={register} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;