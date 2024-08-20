import { render, screen } from "@testing-library/react";
import { act } from "react"; // Import act from react

import App from "./App";

test("renders learn react link", () => {
  act(() => {
    render(<App />);
  });
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).not.toBeNull();
});
