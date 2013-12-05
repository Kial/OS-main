
//Makes an array for the memory and initializes all blocks to 00
// MaxMemory is 768 for the final project

function memory(){
	this.init = function() {
    this.memArray = [""];
	var i =0;
	while(i<_MaxMemory){
		this.memArray[i] = "00";
		document.getElementById(i).innerHTML=this.memArray[i];
		_ProgramCount = 0;
		i++;
	}
    };
	this.convert = function(location)
        {
                        var location = parseInt(location,16);
                        return location;
                
        }
}