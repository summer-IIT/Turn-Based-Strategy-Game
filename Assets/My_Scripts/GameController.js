#pragma strict

public class GameController extends MonoBehaviour{
	private static var ControlInstance: GameController;
	public static function Instance(): GameController{
		return ControlInstance;
	}
	function Awake():void{
		ControlInstance = this;
	}

public var GameMode: String;
public var Limit: int;
public var Player: int;

public var GameState: String;
private var PrevGmState: String;
public var Grid: GameObject;
private var PlayerSpawn1: GameObject;
private var PlayerSpawn2: GameObject;

public var Spawn1: GameObject[];
public var Spawn2: GameObject[];
//public var UnitsField: GameObject[];
public var UnitSelected: GameObject;

public var CubeMove: Vector3;
public var InRange: boolean;

public var POneInfyAction: int;//moving or attacking
public var POneInfyFiring: GameObject;//infantry unit doing action              //using class
public var POneArmorAction: int;
public var POneArmorFiring:GameObject;

public var PTwoInfyAction: int;//p2's units' actions
public var PTwoInfyFiring: GameObject;
public var PTwoArmorAction: int;
public var PTwoArmorFiring: GameObject;

public var POneInfyAvailable: boolean = false;//determines actions in turn
public var POneArmorAvailable: boolean = false;
public var POneActions: int;//number of actions limit per turn
public var PTwoInfyAvailable: boolean = false;
public var PTwoArmorAvailable: boolean = false;
public var PTwoActions: int;

private var ScreenBeam: Ray;
public var RHit: RaycastHit; //what the mouse clicks on
public var UnitHit: RaycastHit; //what's above a cube
public var CamObj: GameObject;
public var Cam: Camera;
public var Cubes: GameObject[];
public var POneUnits: GameObject;//Player one units will be organized under here
public var PTwoUnits: GameObject;//Same but for player two

function Start () {
	CamObj = GameObject.Find("/Main Camera");
	Cam = CamObj.GetComponent.<Camera>();
	POneUnits = new GameObject();
	PTwoUnits = new GameObject();

	if (GameMode == "Fireteam"){
		Limit = 5;
	}else if (GameMode == "Squad") {
		Limit = 10;
	}else if (GameMode == "Platoon") {
		Limit = 30;
	}
	GameState = "Deploy_1";
	Grid = GameObject.Find("CellGrid");
	//Changes the color of the players' deployment areas
	PlayerSpawn1 = Grid.transform.GetChild(0).gameObject;
	PlayerSpawn2 = Grid.transform.GetChild(1).gameObject;
	if(PlayerSpawn1 == null){
		Debug.Log("We can't find Player1's spawn area.");
	}
	if (PlayerSpawn2 == null){
		Debug.Log("We can't find Player2's spawn area.");
	}

	Spawn1 = new GameObject[PlayerSpawn1.transform.childCount];
	Spawn2 = new GameObject[PlayerSpawn2.transform.childCount];

	for (var i: int = 0; i < Spawn1.length; i++){
		Spawn1[i] = PlayerSpawn1.transform.GetChild(i).gameObject;
		Spawn1[i].GetComponent.<Renderer>().material.color = Color.blue;

		Spawn2[i] = PlayerSpawn2.transform.GetChild(i).gameObject;
		Spawn2[i].GetComponent.<Renderer>().material.color = Color.red;
	}
}

function Update () {
	if (GameState == "Combat_1" || GameState == "Deploy_1"){//player1 gets to choose actions
		if (POneUnits.transform.Find("Soldier_demo(Clone)")){
			POneInfyAvailable = true;
		} else {
			POneInfyAvailable = false;
		}
		if (POneUnits.transform.Find("Tank_1(Clone)")){
			POneArmorAvailable = true;
		} else {
			POneArmorAvailable = false;
		}

		if (POneInfyAvailable && POneArmorAvailable){//check for lose conditions
			POneActions = 2;
		} else if (POneInfyAvailable || POneArmorAvailable){
			POneActions = 1;
		} else {//lose condition, player has no actions left
			POneActions = 0;
		}
	} else if (GameState == "Combat_2" || GameState == "Deploy_2"){//player2 gets to choose actions
		if (PTwoUnits.transform.Find("Soldier_demo_1(Clone)")){
			PTwoInfyAvailable = true;
		} else {
			PTwoInfyAvailable = false;
		}
		if (PTwoUnits.transform.Find("Tank_2(Clone)")){
			PTwoArmorAvailable = true;
		} else {
			PTwoArmorAvailable = false;
		}

		if (PTwoInfyAvailable && PTwoArmorAvailable){//check for lose conditions
			PTwoActions = 2;
		} else if (PTwoInfyAvailable || PTwoArmorAvailable){
			PTwoActions = 1;
		} else {//lose condition
			PTwoActions = 0;
		}

		if (GameState == "Combat_2"){//this part of the code is meant for enabling unit cooldowns
			PrevGmState = "Combat_2";
		}
	}

	if (Input.GetButtonDown("Fire1") && GameController.Instance().GameState != "Action"){//if player left clicks
		ScreenBeam = Cam.ScreenPointToRay(Input.mousePosition);
		if (Physics.Raycast(ScreenBeam, RHit)){//if player actually clicks on something
			var CubeCol = RHit.collider;
			if (CubeCol.gameObject.CompareTag("Infantry") || CubeCol.gameObject.CompareTag("Armor") || CubeCol.gameObject.CompareTag("Indirect")){//if player click unit
				SetUnitChosen(CubeCol.gameObject);//for when player clicks on a unit
			} else if (CubeCol.CompareTag("Cube") && UnitSelected != null){//if player clicks on a cube...
				SetCubeArray();//sets up cubes to check thru
				if (CubeCol.gameObject in Cubes){//trying to check if the cube we hit is in the array of cubes we created, not working.
					CubeMove = Vector3(CubeCol.transform.position.x, UnitSelected.transform.position.y,CubeCol.transform.position.z);//where we can move the cube
					//raycast upwards from the cube
					CheckCubeTops(CubeCol.gameObject);
					if (UnitSelected != null && (GameState == "Deploy_1" || GameState == "Deploy_2")){//instantly move your UnitSelected around
						UnitSelected.transform.position = CubeMove;
					} else if (UnitSelected != null) {// if gamestate == combat, queues up move actions FOR WHEN WE ARE NO LONGER IN DEPLOYMENT
						if (UnitSelected.transform.parent.gameObject == POneUnits){//if unitselected is on p1 side
							if (UnitSelected.CompareTag("Infantry")){
								CheckCubeDistance(UnitSelected.GetComponent(Troop).Motion);//check if we r in range
								if (InRange){
									POneInfyFiring = UnitSelected;
									var TroopScript: Troop = UnitSelected.GetComponent(Troop);
									TroopScript.QueueMove(CubeMove);
									Debug.Log("QueueMove has been called");
								}
							} else if (UnitSelected.CompareTag("Armor")){
								CheckCubeDistance(UnitSelected.GetComponent(Tank).Motion);//check if we r in range
								if (InRange){
									UnitSelected.GetComponent(Tank).QueueMove(CubeMove);
									POneArmorFiring = UnitSelected;
									POneArmorAction = 1;
									Debug.Log("QueueMove has been called");
								}
							}
						} else if (UnitSelected.transform.parent.gameObject == PTwoUnits){//if unitselected is on p2 side
							if (UnitSelected.CompareTag("Infantry")){
								CheckCubeDistance(UnitSelected.GetComponent(Troop).Motion);//check if we r in range
								if (InRange){
									UnitSelected.GetComponent(Troop).QueueMove(CubeMove);
									PTwoInfyFiring = UnitSelected;
									PTwoInfyAction = 1;
									Debug.Log("QueueMove has been called");
								}
							} else if (UnitSelected.CompareTag("Armor")){
								CheckCubeDistance(UnitSelected.GetComponent(Tank).Motion);//check if we r in range
								if (InRange){
									UnitSelected.GetComponent(Tank).QueueMove(CubeMove);
									PTwoArmorFiring = UnitSelected;
									PTwoArmorAction = 1;
									Debug.Log("QueueMove has been called");
								}
							}

						}
					}
				}
				InRange = false;
				UnitSelected = null;
			}
		}
	}
}

function CheckCubeDistance(Limits: float){//check to see if a cube/enemy unit is close enough to be interacted with
	var ChosenVect2: Vector2 = Vector2(UnitSelected.transform.position.x,UnitSelected.transform.position.z);
	var CubeVect2: Vector2 = Vector2(CubeMove.x,CubeMove.z);
	if (Vector2.Distance(ChosenVect2,CubeVect2) > (2 * (Limits + 0.7))){
		InRange = false;
		Debug.Log("Out of range");
	} else {
		InRange = true;
		Debug.Log("In range");
	}
}

function SetUnitChosen(pepe: GameObject){//sets target/unitselected if the clicked-on obj is a unit
	if (((GameState == "Deploy_1" || GameState == "Combat_1") && pepe.transform.parent.gameObject == POneUnits) || ((GameState == "Deploy_2" || GameState == "Combat_2") && pepe.transform.parent.gameObject == PTwoUnits)){//change between friendlies
		if (UnitSelected == null || (UnitSelected != null && UnitSelected != pepe)){
			UnitSelected = pepe;
			Debug.Log("UnitSelected has been set");
		} else if (UnitSelected == pepe && (GameState == "Deploy_1" || GameState == "Deploy_2")){//we can delete unwanted units in deployment phase
			var UnitCost: int;
			if (pepe.GetComponent(Tank)){
				UnitCost = pepe.GetComponent(Tank).UnitValue;
			} else if (pepe.GetComponent(Troop)){
				UnitCost = pepe.GetComponent(Troop).UnitValue;
			}
			StartUp.Instance().UpdateUnitCount(-UnitCost);//undoes the unit limit adj
			UnitSelected = null;
			Destroy(pepe);
		} else if (UnitSelected == pepe){//unselects unitselected
			UnitSelected = null;
			Debug.Log("Deselected UnitSelected");
		}
	} else if (GameState == "Combat_1" && pepe.transform.parent != POneUnits){//sets targets on enemies for p1
		if (UnitSelected != null){
		Debug.Log("attack check");
			CubeMove = Vector3(pepe.transform.position.x,UnitSelected.transform.position.y,pepe.transform.position.z);
			if (UnitSelected.CompareTag("Infantry")){
				if (UnitSelected.GetComponent(Troop).UnitCool == 0){
					CheckCubeDistance(UnitSelected.GetComponent(Troop).AtkRange);//check if we r in range
					if (InRange){
						POneInfyFiring = UnitSelected;
						Debug.Log("Target selected");
						UnitSelected.GetComponent(Troop).UnitInteracting = pepe;
					}
				}
			} else if (UnitSelected.CompareTag("Armor")){
				if (UnitSelected.GetComponent(Tank).UnitCool == 0){
					CheckCubeDistance(UnitSelected.GetComponent(Troop).AtkRange);//check if we r in range
					if (InRange){
						POneArmorFiring = UnitSelected;
						Debug.Log("Target selected");
						UnitSelected.GetComponent(Tank).UnitInteracting = pepe;
					}
				}
			}
		}
	} else if (GameState == "Combat_2" && pepe.transform.parent.gameObject != PTwoUnits){//sets targets on enemies for p2
		if (UnitSelected != null){
		Debug.Log("attack check");
			if (UnitSelected.CompareTag("Infantry")){
				if (UnitSelected.GetComponent(Troop).UnitCool == 0){
					CheckCubeDistance(UnitSelected.GetComponent(Troop).AtkRange);//check if we r in range
					if (InRange){
						PTwoInfyFiring = UnitSelected;
						Debug.Log("Target selected");
						UnitSelected.GetComponent(Troop).UnitInteracting = pepe;
					}
				}
			} else if (UnitSelected.CompareTag("Armor")){
				if (UnitSelected.GetComponent(Tank).UnitCool == 0){
					CheckCubeDistance(UnitSelected.GetComponent(Troop).AtkRange);//check if we r in range
					if (InRange){
						PTwoArmorFiring = UnitSelected;
						Debug.Log("Target selected");
						UnitSelected.GetComponent(Tank).UnitInteracting = pepe;
					}
				}
			}
		}
	}	
}

function SetCubeArray (){//sets the cubes that can be interacted with
	if (GameState == "Deploy_1"){
		Cubes = Spawn1;
	} else if (GameState == "Deploy_2"){
		Cubes = Spawn2;
	} else if (GameState == "Combat_1" || GameState == "Combat_2"){
		Cubes = Grid.FindGameObjectsWithTag("Cube");
	}
}

function CheckCubeTops (CubeCheck: GameObject){
	var Upd: Vector3 = CubeCheck.transform.TransformDirection(Vector3.up);
	if (Physics.Raycast(CubeCheck.transform.position, Upd, UnitHit, 2.0f)){//check for things like tanks/heavy infy
		//check if there's stuff already on top of the cube.
		if (UnitHit != null){
			UnitSelected = null;
			Debug.Log("");
		}
	}
}
	// else {//check for infy
//		var UpdLeft: Vector3 = Upd + Vector3(-0.5,0,0);
//		var UpdRight: Vector3 = Upd + Vector3(0.5,0,0);
//		var LeftCast: Vector3 = CubeCheck.transform.position + Vector3(-0.5,0,0);
//		var RightCast: Vector3 = CubeCheck.transform.position + Vector3(0.5,0,0);
//		if (Physics.Raycast(LeftCast,UpdLeft,UnitHit, 2.0f) || Physics.Raycast(RightCast,UpdRight,UnitHit,2.0f)){
//			UnitSelected = null;
//			Debug.Log("");
//		}


//The curly bracket below is for the singleton at the top.
}