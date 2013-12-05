// Process Control Block 

function PCB(){
	this.PID = 0;
	this.base = 0;
	this.limit = 0;
	this.PCLoc = 0;
	this.XRegVal = 0;
	this.YRegVal = 0;
	this.ZFlagVal = 0;
	this.ACCVal = 0;
	this.isDone = false;
	this.priority = 0;
	this.isOnDisk = false;
	
	this.init = function(ID, p){
		this.PID = ID;
		this.PCLoc = 0;
		this.XRegVal = 0;
		this.YRegVal = 0;
		this.ZFlagVal = 0;
		this.ACCVal = 0;
		this.priority = p;
		this.isDone = false;
		this.isOnDisk = false;
		if(ID === 0)
		{
			this.base = _FirstBlock;
			this.limit = _FirstBlock+_MaxBlock;
		}
		else if(ID === 1)
		{
			this.base = _SecondBlock;
			this.limit = _SecondBlock+_MaxBlock;
		}
		else if(ID === 2)
		{
			this.base = _ThirdBlock;
			this.limit = _ThirdBlock+_MaxBlock;
		}
		else
		{
			this.base = 0;
			this.limit = 0;
			this.isOnDisk = true;
		}
	};
	this.checkLimit = function(location)
	{
		if((location + this.base) > this.limit)
		{
			this.isDone = true;
			_StdIn.putText("Out of bounds");
		}
		else
		{
			return (location + this.base);
		}
	};
	
	this.toString = function()
	{
		var toBeReturned = "";
		toBeReturned = "PID: " + this.PID+" PC " + this.PCLoc+ " ACC " + this.ACCVal + " Base: " + this.base + " Limit: " + this.limit + " X value: "+this.XRegVal + " Y value: " + this.YRegVal +" Zero: " + this.ZFlagVal+ " Priority: " +  this.priority + " Is On Disk: " + this.isOnDisk;
		return toBeReturned;
	}
}