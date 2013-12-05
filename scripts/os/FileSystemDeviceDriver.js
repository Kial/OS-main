/* ----------------------------------

  FileSystemDeviceDriver.js

   

  Requires deviceDriver.js

   

  The File System Device Driver.

   ---------------------------------- */
FileSystemDeviceDriver.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.
   
function FileSystemDeviceDriver()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
	// Override the base method pointers.
	this.driverEntry = krnFileDriverEntry;
    this.isr = krnFileOperations;
    // "Constructor" code.
}
function krnFileDriverEntry()
{
    // Initialization routine for this, the kernel-mode File System Device Driver.
	//Just to be safe making sure Local Storage is enabled.
	if(typeof(Storage)!=="undefined")
	{
		this.status = "loaded";
	}
	else
	{
		this.status = "Storage not ready";
	}
}
function krnFileOperations(params)
{
	//Because it's all being held in the same driver I decided to use one IRQ,
	//and just pass in a parameter that included which operation it wanted on the disk.
	var operation = params;
	switch(operation)
	{
		case 0:
		format();
		break;
		case 1: 
		create(params);
		break
		case 2:
		write(params);
		break;
		case 3:
		read(params);
		break;
		case 4:
		deleteFile(params);
		break;
		case 5:
		listFiles();
		break;
		default:
		krnTrapError("It's broke");
		break;    
	}
}
function format()
{
	for(i = 0; i < _NumTracks; i++)
	{
		for(j = 0; j < _NumSectors; j++)
		{
			for(k = 0; k < _NumBlocks; k++)
			{
				var TSB = i.toString() + j.toString() + k.toString();
				localStorage[TSB] = "0SG-------------------------------------------------------------#";
			}
		}
	}
	document.getElementById("btnFiles").disabled = false;
	localStorage[_MBR] = "Master Boot Record#";
}

function create(params)
{
	emptyDir = findMetaData();
	if(!emptyDir)
	{
		_StdIn.putText("No Space");
		_StdIn.advanceLine();
		_StdIn.putText(_OsShell.promptStr);
	}
	else
	{
		if(!findAvailableData())
		{
			_StdIn.putText("No Data");
		}
		localStorage[emptyDir] = "1" + findAvailableData() + _FileName + "#";
		localStorage[findAvailableData()] = "1SG" + localStorage[findAvailableData()].substring(4);
	}
}
function write(params)
{
	var location = findFileName(_FileName);
	var i = 0;
	if(location)
	{
		if(localStorage[location].substring(1,4) !== "SG")
		{
			deleteFile(_FileName);
			create(_FileName);
		}
		location = findFileName(_FileName);
		var NeMem = Math.floor(_ToBeWritten.length/_WritableChar) + 1;
		while(NeMem > 0)
		{
			gonnaBeWritten = _ToBeWritten.substring(i*_WritableChar,(i*_WritableChar + _WritableChar));
			localStorage[location] = "1SG";
			if(NeMem === 1)
			{
				localStorage[location] = "1SG" + gonnaBeWritten + "#";
				NeMem--;
				if(!_ToBePrinted)
				{
					_ToBePrinted = true;
					_CPU.isDoneWriting();
				}
			}
			else
			{
				if(findAvailableData())
				{
					localStorage[location] = "1" + findAvailableData() + gonnaBeWritten;
					location = findAvailableData();
					NeMem--;
				}
				else
				{
					_StdIn.putText("Not enough room for everything");
					NeMem = 0;
				}
			}
			i++;
		}
	}
	else
	{
		_StdIn.putText("Couldn't find file");
		_StdIn.advanceLine();
		_StdIn.putText(_OsShell.promptStr);
		_ToBeWritten = "";
	}
}


function read(params)
{
	var location = findFileName(_FileName);
	var i = 0;
	var atTheEnd = false;
	_ToBeRead = "";
	if(location)
	{
		while(!atTheEnd)
		{
			if(localStorage[location].indexOf("#") !== -1)
			{
				_ToBeRead += localStorage[location].substring(4, localStorage[location].indexOf("#"));
				if(_ToBePrinted)
				{
					for(i = 0; i < _ToBeRead.length; i++)
					{
						_StdIn.putText(_ToBeRead[i]);
					}
					_StdIn.advanceLine();
					_StdIn.putText(_OsShell.promptStr);
				}
				else
				{
					_CPU.toRead();
				}
				atTheEnd = true;
			}
			else
			{
				_ToBeRead += localStorage[location].substring(4);
				location = localStorage[location].substring(1,4);
			}
		}
	}
	else
	{
		_StdIn.putText("Couldn't find file");
		_StdIn.advanceLine();
		_StdIn.putText(_OsShell.promptStr);
	}  
	
}
function deleteFile(params)
{
	var location = findFileName(_FileName);
	var i = 0;
	var atTheEnd = false;
	if(location)
	{
		while(!atTheEnd)
			if(localStorage[location].indexOf("#") !== -1)
			{
				localStorage[location] = "0SG" + localStorage[location].substring(4);
				localStorage[findFile(_FileName)] = "0SG" + localStorage[findFile(_FileName)].substring(4);
				atTheEnd = true;
			}
			else
			{
				location2 = location;
				location = localStorage[location].substring(1,4);
				localStorage[location2] = "0SG" + localStorage[location].substring(4);
			}
	}
	else
	{
		_StdIn.putText("Couldn't find file");
		_StdIn.advanceLine();
		_StdIn.putText(_OsShell.promptStr);
	}  
}
function findAvailableData()
{
//Search for an open data block
	for(i = 1; i < _NumTracks; i++)
	{	
		for(j = 0; j < _NumSectors; j++)
		{	
			for(k = 0; k < _NumBlocks; k++)
			{
				var TSB = i.toString() + j.toString() + k.toString();
				if(localStorage[TSB][0] === "0")
				{
					return TSB;
				}
			}
		}
	}
	return false;
}

function findMetaData()
{
//Find a new League Meta
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "0")
			{
				return TSB;
			}
		}
	}
	return false;
}
function findFileName(_FileName)
{
//Search for a file location
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
				var tempFileName = localStorage[TSB].substring(4, localStorage[TSB].indexOf("#"));
				if(tempFileName === _FileName)
				{
					return localStorage[TSB].substring(1,4);
				}
			}
		}
	}
	return false;
}

function findFile(_FileName)
{
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
				var tempFileName = localStorage[TSB].substring(4, localStorage[TSB].indexOf("#"));
				if(tempFileName === _FileName)
				{
					return TSB;
				}
			}
		}
	}
	return false;
}
function listFiles()
{
  //Make the file list

	i = 0;
	var toBeReturned = "";
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
				_StdIn.putText(localStorage[TSB].substring(4));
				_StdIn.advanceLine();
			}
		}
	}
	_StdIn.advanceLine();
	_StdIn.putPrompt();
}