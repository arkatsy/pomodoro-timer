import { test, expect } from "vitest";
import InputNumber from "@/components/ui/input-number";
import { getAllByRole, getByRole, render, userEvent } from "@/tests/utils";

test("should render correctly", () => {
  const { container } = render(<InputNumber />);

  const inputs = container.getElementsByTagName("input");
  expect(inputs.length).toBe(1);

  const input = inputs[0];
  expect(input).not.toBeNull();
  const isContentEmptyOrZero = input?.value === "" || input?.value === "0";
  expect(isContentEmptyOrZero).toBe(true);
});

test("should render with default value", () => {
  const { container } = render(<InputNumber defaultValue={10} />);

  const input = container.querySelector("input") as HTMLInputElement;
  expect(input).not.toBeNull();
  expect(input.value).toBe("10");
});

test("should allow only numbers as input", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} />);

  const input = container.querySelector("input") as HTMLInputElement;
  expect(input).not.toBeNull();

  await user.click(input);
  await user.keyboard("c");
  expect(input.value).toBe("0");
  await user.keyboard("te");
  await user.keyboard("st");
  expect(input.value).toBe("0");
});

test("should increment value when clicking on the plus button according to the step", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} />);
  const input = container.querySelector("input") as HTMLInputElement;
  const plusButtons = getAllByRole(container, "button", { name: "increment" });

  expect(plusButtons.length).toBe(1);
  const plusButton = plusButtons[0];
  await user.click(plusButton);
  expect(input.value).toBe("1");
  await user.click(plusButton);
  expect(input.value).toBe("2");
  await user.click(plusButton);
  await user.click(plusButton);
  await user.click(plusButton);
  expect(input.value).toBe("5");
});

test("should increment value when clicking on the plus button no more than the max", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} max={5} />);
  const input = container.querySelector("input") as HTMLInputElement;
  const plusButton = getAllByRole(container, "button", { name: "increment" })[0];
  for (let i = 0; i < 10; ++i) {
    await user.click(plusButton);
  }
  expect(input.value).toBe("5");
});

test("should decrement value when clicking on the minus button according to the step", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={10} min={0} />);
  const input = container.querySelector("input") as HTMLInputElement;
  const minusButton = getByRole(container, "button", { name: "decrement" });
  await user.click(minusButton);

  expect(input.value).toBe("9");
  await user.click(minusButton);
  expect(input.value).toBe("8");
  await user.click(minusButton);
  await user.click(minusButton);
  await user.click(minusButton);
  expect(input.value).toBe("5");
});

test("should decrement value when clicking on the minus button no less than the 0 or min", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} min={0} />);
  const input = container.querySelector("input") as HTMLInputElement;
  const minusButton = getByRole(container, "button", { name: "decrement" });
  for (let i = 0; i < 10; ++i) {
    await user.click(minusButton);
  }
  expect(input.value).toBe("0");
});

test("should increment value when pressing up arrow key according to the step", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} />);
  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("1");
  expect(input.value).toBe("1");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("2");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("3");
  await user.keyboard("{arrowup}");
  await user.keyboard("{arrowup}");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("6");
});

test("should increment value when pressing up arrow key no more than the max", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} max={5} />);
  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("1");
  expect(input.value).toBe("1");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("2");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("3");
  await user.keyboard("{arrowup}");
  await user.keyboard("{arrowup}");
  await user.keyboard("{arrowup}");
  expect(input.value).toBe("5");
});

test("should decrement value when pressing down arrow key according to the step", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} />);
  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("5");
  expect(input.value).toBe("5");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("4");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("3");
  await user.keyboard("{arrowdown}");
  await user.keyboard("{arrowdown}");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("0");
});

test("should decrement value when pressing down arrow key no less than the 0 or min", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} min={0} />);
  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("5");
  expect(input.value).toBe("5");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("4");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("3");
  await user.keyboard("{arrowdown}");
  await user.keyboard("{arrowdown}");
  await user.keyboard("{arrowdown}");
  expect(input.value).toBe("0");
});

test("should not allow negative numbers as input", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} />);
  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("-");
  expect(input.value).toBe("0");
  await user.keyboard("-");
  await user.keyboard("1");
  expect(input.value).toBe("1");
  await user.keyboard("{backspace}");
  await user.keyboard("-1");
  expect(input.value).toBe("1");
});

test("any number inputted from the keyboard that's bigger than max should be converted to max", async () => {
  const user = userEvent.setup();
  const { container } = render(<InputNumber defaultValue={0} max={10} />);

  const input = container.querySelector("input") as HTMLInputElement;

  await user.click(input);
  await user.keyboard("1");
  await user.keyboard("1");
  await user.keyboard("1");
  expect(input.value).toBe("10");

  await user.keyboard("{backspace}");
  await user.keyboard("{backspace}");
  await user.keyboard("{backspace}");
  await user.keyboard("20");
  expect(input.value).toBe("10");
});
