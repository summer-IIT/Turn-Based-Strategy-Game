#pragma strict

import UnityEngine.SceneManagement;

public class StartUp extends MonoBehaviour {
	private static var Iduncare: StartUp;
	public static function Instance(): StartUp{
		return Iduncare;
	}
	function Awake():void{
		Iduncare = this;
	}

public var UnitCount: int;

public var UnitCountTxt: GUIText;
public var InvalidUnitsTxt: GUIText;
public var MenuText: GUIText;

private var StartGame: boolean;
private var Restart: boolean;


function Start () {
	Restart= false;
	UnitCount = 0;
	UnitCountTxt.text= "Unit Count: 0/" + GameController.Instance().Limit;
	unitMenu();
}

function Update () {
	if (Input.GetKeyDown(KeyCode.T) && (UnitCount <= GameController.Instance().Limit)){//sets up turn switch
		StartGame= true;
	}
	if (StartGame){//initiates turn switch
		startGame();//calls startgame function
	}
	if (Input.GetKeyUp(KeyCode.R)){//reset the game if there's been a victory and right click was pressed
		if (GameController.Instance().GameState == "Victory_1" || GameController.Instance().GameState == "Victory_1"){
			SceneManager.LoadScene("Demo_Scene");
		}
	}
}

function UpdateUnitCount (UnitCountIncrement: int){//makes sure unit count is accurate, called by units when they r spawned in
	if ((UnitCount + UnitCountIncrement) <= GameController.Instance().Limit){
		UnitCount = UnitCount + UnitCountIncrement;
		UpdateUnitCountTxt();
	}
	if (UnitCount == GameController.Instance().Limit){
		InvalidUnitsTxt.text= "I HAVE THE HIGH GROUND, PUSH 'T'";
	}
	if (UnitCount >= GameController.Instance().Limit){
		UnitSelection.Instance().TankButt.interactable = false;
		UnitSelection.Instance().TroopButt.interactable = false;
	}
}

function UpdateUnitCountTxt (){
	UnitCountTxt.text = "Unit Count:" + UnitCount.ToString() + "/" + GameController.Instance().Limit;
	if (UnitCount < GameController.Instance().Limit){
		InvalidUnitsTxt.text= "";
		UnitSelection.Instance().TankButt.interactable = true;
		UnitSelection.Instance().TroopButt.interactable = true;
	}
}

function unitMenu (){
	if (GameController.Instance().GameState == "Deploy_1"){
		MenuText.text= "Player one, choose your units!";
	} else if (GameController.Instance().GameState == "Deploy_2"){
		MenuText.text= "Player two, choose your units!";
	}
}


function startGame(){//turn switch system
	if (GameController.Instance().GameState == "Deploy_1"){
		GameController.Instance().GameState = "Deploy_2";
		UnitCount = 0;
		UnitCountTxt.text= "Unit Count: 0/" + GameController.Instance().Limit;
		unitMenu();
	} else if (GameController.Instance().GameState == "Deploy_2" || GameController.Instance().GameState == "Action_End"){
		GameController.Instance().GameState = "Combat_1";
		MenuText.text = "Player one's soldiers await orders!";
		UnitCountTxt.text = "";
	} else if (GameController.Instance().GameState == "Combat_1"){
		GameController.Instance().GameState = "Combat_2";
		MenuText.text = "Player two's soldiers await orders!";
	} else if (GameController.Instance().GameState == "Combat_2"){
		GameController.Instance().GameState = "Action";
		MenuText.text = "pew pew";
	}
	if (GameController.Instance().GameState != "Action"){
		InvalidUnitsTxt.text = "";
	}
	if (GameController.Instance().GameState == "Action"){
		yield WaitForSeconds(3);//let actions play out
		if (GameController.Instance().PTwoActions == 0){//lose conditions, set txt to defeat text
			GameController.Instance().GameState = "Victory_1";
			MenuText.text = "PLAYER ONE WINS! 'R' TO RESTART";
			InvalidUnitsTxt.text = "Player 2 should be executed for incompetence";
		} else if (GameController.Instance().POneActions == 0){
			GameController.Instance().GameState = "Victory_2";
			MenuText.text = "PLAYER TWO WINS 'R' TO RESTART";
			InvalidUnitsTxt.text = "Player 1 should be executed for incompetence";
		} else {//set action end,
			GameController.Instance().GameState = "Action_End";//if no one lost, then go back into the loop
			MenuText.text = "Press 'T' to continue this trashy game";
		}
	}

	if (GameController.Instance().GameState == "Deploy_1" || GameController.Instance().GameState == "Deploy_2"){//set buttons
		UnitSelection.Instance().TankButt.interactable = true;
		UnitSelection.Instance().TroopButt.interactable = true;
	} else {
		UnitSelection.Instance().TankButt.interactable = false;
		UnitSelection.Instance().TroopButt.interactable = false;
	}
	StartGame = false;
}
//singleton curly bracket
}
