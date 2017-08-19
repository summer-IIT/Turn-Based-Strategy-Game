#pragma strict

public var HealthTxt: GUIText;
public var HealthNum: int;
private var Target: Transform;
private var CamObj: GameObject;
private var Cam: Camera;

function Start () {
	CamObj = GameObject.Find("/Main Camera");
	Cam = CamObj.GetComponent.<Camera>();
	Target = gameObject.transform.parent;
}

function Update (){
	if (gameObject.CompareTag("Infantry")){//check parent tag to see how this is classified
		HealthNum = gameObject.GetComponent(Troop).Health;
		HealthTxt.text = HealthNum.ToString();
	} else if (gameObject.CompareTag("Armor")){//like, if it's a tank, it'll have dif health values.
		HealthNum = gameObject.GetComponent(Tank).Health;
		HealthTxt.text = HealthNum.ToString();
	}
	var WantedPos = Camera.main.WorldToScreenPoint(Target.transform.position);//update health text position
	HealthTxt.transform.position = WantedPos;
}
