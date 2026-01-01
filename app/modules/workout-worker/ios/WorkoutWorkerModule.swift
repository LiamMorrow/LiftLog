import ExpoModulesCore

public class WorkoutWorkerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorkoutWorker")


    Events("on")


    Function("broadcast") { (bytes :Data) in

    }
  }
}
