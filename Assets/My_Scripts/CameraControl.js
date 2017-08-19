#pragma strict

public var Spoohd: float;

class Boundary1 {
	public var xMin: float;
	public var xMax: float;
	public var zMin: float;
	public var zMax: float;
}

class Boundary2 {
	public var xMin: float;
	public var xMax: float;
	public var zMin: float;
	public var zMax: float;
}

public var Limits1: Boundary1;
public var Limits2: Boundary2;
public var BlueCam: Vector3;
public var RedCam: Vector3;

function Start () {
	BlueCam = gameObject.transform.eulerAngles;
	RedCam = Vector3((2 * BlueCam.x), -BlueCam.y, (BlueCam.z + 180));
}

function FixedUpdate () {
	var MoveH: float = Spoohd * Input.GetAxis("Horizontal");
	var MoveV: float = Spoohd * Input.GetAxis("Vertical");
	if (GameController.Instance().GameState == "Deploy_2" || GameController.Instance().GameState == "Combat_2"){
		MoveV = -MoveV;
		MoveH = -MoveH;
	}
	var Vect: Vector3 = Vector3(MoveH, 0, MoveV);
	transform.position += Vect * Time.deltaTime;
	if (GameController.Instance().GameState == "Deploy_2" || GameController.Instance().GameState == "Combat_2" || GameController.Instance().GameState == "Victory_2"){
		transform.rotation.eulerAngles = RedCam;
		transform.position = Vector3(
			Mathf.Clamp(transform.position.x,Limits2.xMin,Limits2.xMax),
			transform.position.y,
			Mathf.Clamp(transform.position.z,Limits2.zMin,Limits2.zMax));
	} else if(GameController.Instance().GameState == "Deploy_1" || GameController.Instance().GameState == "Combat_1" || 
		GameController.Instance().GameState == "Action" || GameController.Instance().GameState == "Action_End" || GameController.Instance().GameState == "Victory_1"){
		transform.rotation.eulerAngles = BlueCam;
		transform.position = Vector3(
			Mathf.Clamp(transform.position.x,Limits1.xMin,Limits1.xMax),
			transform.position.y,
			Mathf.Clamp(transform.position.z,Limits1.zMin,Limits1.zMax));
	}
}