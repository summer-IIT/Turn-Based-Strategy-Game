#pragma strict

public class UnitSelection extends MonoBehaviour {
	private static var Select: UnitSelection;
	public static function Instance(): UnitSelection{
		return Select;
	}
	function Awake(): void{
		Select = this;
	}

public var TankSpawnRed: GameObject;//player 2
public var TankSpawnBlue: GameObject;//player 1
private var TankUnitPoints: int;
private var TankScript: Tank;
public var TroopSpawnRed: GameObject;
public var TroopSpawnBlue: GameObject;
private var TroopUnitPoints: int;
private var TroopScript: Troop;
public var spawnPositionRed: Vector3 = Vector3(0.5,0,18.5);
public var spawnPositionBlue: Vector3 = Vector3(0.5,0,-5);
public var TankButt: UnityEngine.UI.Button;
public var TroopButt: UnityEngine.UI.Button;
var contentTank: GUIContent;
var styleTank: GUIStyle = new GUIStyle();
var contentTroop: GUIContent;
var styleTroop: GUIStyle = new GUIStyle();
var showWindow1: boolean;
var showWindow2: boolean;

function Start (){
	TankScript = TankSpawnRed.GetComponent(Tank);
	TroopScript = TroopSpawnBlue.GetComponent(Troop);
	TankUnitPoints = TankScript.UnitValue;
	TroopUnitPoints = TroopScript.UnitValue;
	TnkButt();
	TrpButt();
	showWindow1= false;
	showWindow2= false;
}

function TnkButt() {
	var btn: UnityEngine.UI.Button = TankButt.GetComponent.<UnityEngine.UI.Button>();
	btn.onClick.AddListener(TaskOnClick);
}

function TaskOnClick(){
	if((TankUnitPoints + StartUp.Instance().UnitCount) <= GameController.Instance().Limit){
		if(GameController.Instance().GameState == "Deploy_1"){
			Instantiate (TankSpawnBlue, spawnPositionBlue, TankSpawnBlue.transform.rotation, GameController.Instance().POneUnits.transform);
		} else if (GameController.Instance().GameState == "Deploy_2"){
			Instantiate (TankSpawnRed, spawnPositionRed, TankSpawnRed.transform.rotation, GameController.Instance().PTwoUnits.transform);
		}
	}
}

function TrpButt() {
	var btno: UnityEngine.UI.Button = TroopButt.GetComponent.<UnityEngine.UI.Button>();
	btno.onClick.AddListener(TaskOnClicku);
}

function TaskOnClicku(){
	if((TroopUnitPoints + StartUp.Instance().UnitCount) <= GameController.Instance().Limit){
		if(GameController.Instance().GameState == "Deploy_1"){
			Instantiate (TroopSpawnBlue, spawnPositionBlue, TroopSpawnBlue.transform.rotation, GameController.Instance().POneUnits.transform);
		} else if (GameController.Instance().GameState == "Deploy_2"){
			Instantiate (TroopSpawnRed, spawnPositionRed, TroopSpawnRed.transform.rotation, GameController.Instance().PTwoUnits.transform);
		}
	}
}


function OnGUI(){
	if (showWindow1){
		GUI.Box(new Rect(10, 370, Screen.width/3.5, Screen.height/3), contentTank,styleTank);
	}
	if (showWindow2){
		GUI.Box(new Rect(10, 370, Screen.width/3.5, Screen.height/3), contentTroop,styleTroop);
	}
}

function pointerenter1(){
showWindow1 = true;
}

function pointerexit1(){
showWindow1 = false;
}

function pointerenter2(){
showWindow2 = true;
}

function pointerexit2(){
showWindow2 = false;
}
//Singleton curly bracket.
}