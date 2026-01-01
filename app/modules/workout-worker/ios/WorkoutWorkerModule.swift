import ExpoModulesCore

public class WorkoutWorkerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorkoutWorker")


    Events("on")


    Function("broadcast") { (type: String, bytes :Data) in

    }
  }
}
