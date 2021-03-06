import {scheduleMicrotask, scheduleMacrotask, currentFrame, nextFrame, clock} from "../lib/scheduler";

const expect = chai.expect;

describe("Scheduler", () => {
  describe("execution order", () => {
    it("should execute microtasks before macrotasks", (done) => {
      let i = 0;
      scheduleMacrotask(() => {
        expect(i).to.equal(1);
        done();
      });
      scheduleMicrotask(() => {
        expect(i).to.equal(0);
        i = 1;
      });
    });

    it("should batch read/write/after frame tasks", (done) => {
      nextFrame().write(() => {
        let i = 0;
        currentFrame().after(() => {
          expect(i).to.equal(6);
          i = 7;
        });
        currentFrame().after(() => {
          expect(i).to.equal(7);
          done();
        });
        currentFrame().read(() => {
          expect(i).to.equal(1);
          i = 2;
        });
        currentFrame().read(() => {
          expect(i).to.equal(2);
          i = 3;
          currentFrame().write(() => {
            expect(i).to.equal(4);
            i = 5;
          });
          currentFrame().write(() => {
            expect(i).to.equal(5);
            i = 6;
          });
          currentFrame().read(() => {
            expect(i).to.equal(3);
            i = 4;
          });
        });
        currentFrame().write(() => {
          expect(i).to.equal(0);
          i = 1;
        });
      });
    });
  });

  describe("monotonically increasing clock", () => {
    it("should advance clock by 1 after microtask execution", (done) => {
      const c = clock();
      scheduleMicrotask(() => {
        expect(clock()).to.equal(c);
        setTimeout(() => {
          expect(clock()).to.equal(c + 1);
          done();
        }, 10);
      });
    });

    it("should advance clock by 1 after macrotask execution", (done) => {
      const c = clock();
      scheduleMacrotask(() => {
        expect(clock()).to.equal(c);
        setTimeout(() => {
          expect(clock()).to.equal(c + 1);
          done();
        }, 10);
      });
    });

    it("should advance clock by 1 after after next frame", (done) => {
      const c = clock();
      nextFrame().after(() => {
        expect(clock()).to.equal(c);
        setTimeout(() => {
          expect(clock()).to.equal(c + 1);
          done();
        }, 10);
      });
    });

    it("should have the same clock when switching between read and write batches", (done) => {
      const c = clock();
      nextFrame().write(() => {
        expect(clock()).to.equal(c);
        currentFrame().read(() => {
          expect(clock()).to.equal(c);
          currentFrame().write(() => {
            expect(clock()).to.equal(c);
            setTimeout(() => {
              expect(clock()).to.equal(c + 1);
              done();
            }, 10);
          });
        });
      });
    });
  });
});
