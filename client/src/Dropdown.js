import React,{useState,useEffect} from 'react';


function Dropdown({onSelect,activeItem,items}) {
    const [dropdownVisible,setDropdownVisible]=useState(false);

    const selectItem=(e,value)=>{
      e.preventDefault();
      setDropdownVisible(!dropdownVisible);
      onSelect(value);
    }


    useEffect(()=>{
      const init=async ()=>{
      console.log("**@ 999999999999999999  tokens are , ",items);
      console.log("**@ 99999999999999999999999999  selected token label  is , ",activeItem.label);
      console.log("**@ 999999999999999999999999999999  value is , ",activeItem.value)
      console.log("**@ onselect is , ",onSelect);
      }

      init();
    })




    return (
        <div className="dropdown ml-3">
  <button className="btn btn-secondary dropdown-toggle"
   type="button"
   onClick={()=>setDropdownVisible(!dropdownVisible)}
   >
 {activeItem.label}
  </button>


  <div className={`dropdown-menu ${dropdownVisible?'visible':''}`} >
      {
          items && items.map((item,i)=>(
            <a className={`dropdown-item ${item.value===activeItem.value?'active':null}`}
             href="#"
             key={i}
             onClick={(e)=>(selectItem(e,item.value))}
             >
            {item.label}
            </a>

          ))
      }
   
  </div>
</div>
    )
}

export default Dropdown
