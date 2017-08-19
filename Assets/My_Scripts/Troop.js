#pragma strict

public var UnitValue: int;
public var speed: float;

public var Health: int;
public var Death: GameObject;
static public var MaxHealth: int = 75;
static public var Damage: int = 50;
static public var Motion: float = 2;
static public var UnitCost: int = 1;
static public var AtkRange: float = 2;
static public var Accuracy: float = 80;
static public var Cooldown: int = 1;
public var UnitCool: int;
private var PrevGmState: String;
public var UnitInteracting: GameObject;//is set by other scripts to see what the object this unit will be working with is
public var MoveTo: Vector3;//set by outside scripts in case of "combat"/"action" gamestates

function Attack (){
	var HitChance: float = Random.Range(0.0, 100.0);
	if (GameController.Instance().POneInfyFiring == gameObject || GameController.Instance().PTwoInfyFiring == gameObject){//makes sure infy is queued
		if (HitChance < Accuracy){//aka if the unit doesn't miss its shot
			if (UnitInteracting.CompareTag("Infantry")){
				UnitInteracting.GetComponent(Troop).Health -= Damage;
			} else if (UnitInteracting.CompareTag("Armor")){
				UnitInteracting.GetComponent(Tank).Health -= Damage;
			}
		}
	}
	UnitInteracting = null;
}

function QueueMove (DestinVect: Vector3){
	MoveTo = DestinVect;
}

function Start () {
	Health = MaxHealth;
	UnitCool = 0;
	UpdateUnit();//on creation update the unit cost value
}

function UpdateUnit () {
	StartUp.Instance().UpdateUnitCount(UnitValue);
}

function Update () {
	if (GameController.Instance().GameState != "Action"){//sets up so that UnitCool - 1 when GameState == "Action"
		PrevGmState = GameController.Instance().GameState;
	}
	if (PrevGmState != GameController.Instance().GameState && GameController.Instance().GameState == "Action"){//if the game just switched 2 the "Action" turn
		PrevGmState = GameController.Instance().GameState;
		if (UnitCool > 0){
			UnitCool = UnitCool - 1;//REDUCES KUHLDOWN!
			UnitInteracting = null;//making sure nothing slips thru the cracks
		}
	}
	if (GameController.Instance().GameState == "Action"){
		if (UnitInteracting != null){//attack the unit, set cooldown
			Attack();
		}
	} else if (GameController.Instance().GameState == "Action_End"){
		if(Health <= 0){
			Instantiate(Death, gameObject.transform.position, Death.transform.rotation);
			Destroy(gameObject);
		} else {
			SetCoolDown();
			if (GameController.Instance().POneInfyFiring == gameObject || GameController.Instance().PTwoInfyFiring == gameObject){
				if (MoveTo != gameObject.transform.position){
					gameObject.transform.position = MoveTo;
					MoveTo = gameObject.transform.position;
				}
			}
		}
	}
}

function OnTriggerEnter (OtherCollider: Collider) {//if this unit collides with another, then do dmg to both
	if (GameController.Instance().GameState != "Deploy_1" || GameController.Instance().GameState != "Deploy_2"){
		if (OtherCollider.CompareTag("Infantry")){//if othercollider is a soldier...
			if (OtherCollider.gameObject.GetComponent(Troop).Health < Health){//if enemy infy has less health than this unit
				Instantiate(Death, OtherCollider.gameObject.transform.position, Death.transform.rotation);
				Destroy(OtherCollider.gameObject);
				Health = Health - OtherCollider.gameObject.GetComponent(Troop).Health;
			} else if (OtherCollider.gameObject.GetComponent(Troop).Health == Health){//if enemy infy has same health as unit
				Instantiate(Death, gameObject.transform.position, Death.transform.rotation);
				Destroy(OtherCollider.gameObject);
				Destroy(gameObject);
			}
		} else if (OtherCollider.CompareTag("Armor")){//if othercollider is a tank...
			if (OtherCollider.gameObject.GetComponent(Tank).Health < Health){//if enemy infy has less health than this unit
				Instantiate(Death, OtherCollider.gameObject.transform.position, Death.transform.rotation);
				Destroy(OtherCollider.gameObject);
				Health = Health - OtherCollider.gameObject.GetComponent(Tank).Health;
			} else if (OtherCollider.gameObject.GetComponent(Tank).Health == Health){//if enemy infy has same health as unit
				Instantiate(Death, gameObject.transform.position, Death.transform.rotation);
				Destroy(OtherCollider.gameObject);
				Destroy(gameObject);
			}
		}
	}
}

function SetCoolDown (){
	if (UnitInteracting != null){
		UnitInteracting = null;
		UnitCool = Cooldown;//set cooldown to be on
	}
}
