import {ComponentDescriptor} from "../lib/component";
import {LifecycleComponent} from "./lifecycle";
import {VModel} from "../lib/vmodel";

describe("Component", () => {
  describe("create dom", () => {
    it("should create element with default tag: div", () => {
      const d = new ComponentDescriptor<any, any>();
      const c = d.createRootComponent();
      expect(c.element.tagName).toBe("DIV");
      expect(c.element).isPrototypeOf(HTMLElement);
    });

    it("should create element with tag span", () => {
      const d = new ComponentDescriptor<any, any>()
        .tagName("span");
      const c = d.createRootComponent();
      expect(c.element.tagName).toBe("SPAN");
      expect(c.element).isPrototypeOf(HTMLElement);
    });

    it("should create svg element with tag a", () => {
      const d = new ComponentDescriptor<any, any>()
        .tagName("a")
        .svg();
      const c = d.createRootComponent();
      expect(c.element).isPrototypeOf(SVGElement);
    });

    it("should create canvas element", () => {
      const d = new ComponentDescriptor<any, any>()
        .canvas();
      const c = d.createRootComponent();
      expect(c.element.tagName).toBe("CANVAS");
      expect(c.element).isPrototypeOf(HTMLCanvasElement);
      expect(c.get2DContext()).isPrototypeOf(CanvasRenderingContext2D);
    });

    it("should create element from vmodel", () => {
      const m = new VModel("span");
      const d = new ComponentDescriptor<any, any>()
        .vModel(m);
      const c = d.createRootComponent();
      expect(c.element.tagName).toBe("SPAN");
      expect(c.element).isPrototypeOf(HTMLElement);
    });

    it("should have depth 0 if no parent", () => {
      const d = new ComponentDescriptor<any, any>();
      const c = d.createRootComponent();
      expect(c.depth).toBe(0);
    });

    it("should have depth 1 if parent have depth 0", () => {
      const d = new ComponentDescriptor<any, any>();
      const p = d.createRootComponent();
      const c = d.createComponent(p);
      expect(c.depth).toBe(1);
    });

    it("should have depth 2 if parent have depth 1", () => {
      const d = new ComponentDescriptor<any, any>();
      const gp = d.createRootComponent();
      const p = d.createComponent(gp);
      const c = d.createComponent(p);
      expect(c.depth).toBe(2);
    });

    it("should have mtime 0 when created", () => {
      const d = new ComponentDescriptor<any, any>();
      const c = d.createRootComponent();
      expect(c.mtime).toBe(0);
    });
  });

  describe("lifecycle methods", () => {
    it("should execute init hook when component is created", () => {
      const c = LifecycleComponent.createRootComponent();
      expect(c._state!.checkInit).toBe(0);
      expect(c._state!.checkUpdate).toBe(-1);
      expect(c._state!.checkAttached).toBe(-1);
      expect(c._state!.checkDetached).toBe(-1);
      expect(c._state!.checkDisposed).toBe(-1);
    });

    it("shouldn't execute update hook on update in detached state", () => {
      const c = LifecycleComponent.createRootComponent();
      c.update();
      expect(c._state!.checkInit).toBe(0);
      expect(c._state!.checkUpdate).toBe(-1);
      expect(c._state!.checkAttached).toBe(-1);
      expect(c._state!.checkDetached).toBe(-1);
      expect(c._state!.checkDisposed).toBe(-1);
    });

    it("should execute update hook on update in attached state", () => {
      const c = LifecycleComponent.createRootComponent();
      c.attach();
      c.update();
      expect(c._state!.checkInit).toBe(0);
      expect(c._state!.checkUpdate).toBe(2);
      expect(c._state!.checkAttached).toBe(1);
      expect(c._state!.checkDetached).toBe(-1);
      expect(c._state!.checkDisposed).toBe(-1);
    });

    it("should execute detached hook when component is detached", () => {
      const c = LifecycleComponent.createRootComponent();
      c.attach();
      c.detach();
      expect(c._state!.checkInit).toBe(0);
      expect(c._state!.checkUpdate).toBe(-1);
      expect(c._state!.checkAttached).toBe(1);
      expect(c._state!.checkDetached).toBe(2);
      expect(c._state!.checkDisposed).toBe(-1);
    });

    it("should execute detached and disposed hook when component is disposed", () => {
      const c = LifecycleComponent.createRootComponent();
      c.attach();
      c.dispose();
      expect(c._state!.checkInit).toBe(0);
      expect(c._state!.checkUpdate).toBe(-1);
      expect(c._state!.checkAttached).toBe(1);
      expect(c._state!.checkDetached).toBe(2);
      expect(c._state!.checkDisposed).toBe(3);
    });
  });
});
