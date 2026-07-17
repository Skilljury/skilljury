import assert from "node:assert/strict";
import test from "node:test";

import { getDailySyncWindow, selectUrlWindow } from "./syncSchedule";

test("selectUrlWindow returns only the requested offset window", () => {
  const urls = Array.from({ length: 12 }, (_, index) => `skill-${index}`);

  assert.deepEqual(selectUrlWindow(urls, 5, 4), [
    "skill-5",
    "skill-6",
    "skill-7",
    "skill-8",
  ]);
});

test("getDailySyncWindow rotates deterministically through all chunks", () => {
  const firstDay = getDailySyncWindow(
    4_274,
    900,
    new Date("2026-07-17T00:00:00.000Z"),
  );
  const nextDay = getDailySyncWindow(
    4_274,
    900,
    new Date("2026-07-18T00:00:00.000Z"),
  );

  assert.equal(firstDay.totalChunks, 5);
  assert.equal(firstDay.limit, 900);
  assert.equal(nextDay.chunkIndex, (firstDay.chunkIndex + 1) % 5);
  assert.equal(nextDay.offset, nextDay.chunkIndex * 900);
});

test("getDailySyncWindow clips the final chunk to the remaining items", () => {
  const window = getDailySyncWindow(
    4_274,
    900,
    new Date("2026-07-16T00:00:00.000Z"),
  );

  if (window.chunkIndex === 4) {
    assert.equal(window.offset, 3_600);
    assert.equal(window.limit, 674);
  } else {
    assert.equal(window.limit, 900);
  }
});

test("sync window helpers reject invalid sizes and offsets", () => {
  assert.throws(() => getDailySyncWindow(0, 900), /totalItems/);
  assert.throws(() => getDailySyncWindow(100, 0), /chunkSize/);
  assert.throws(() => selectUrlWindow(["a"], -1, 1), /offset/);
  assert.throws(() => selectUrlWindow(["a"], 0, 0), /limit/);
});
