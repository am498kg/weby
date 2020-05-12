function opinion2html(opinion){

    // const opinionTemplate=
    //     `
    // <section>
    //    <h3>${opinion.meno} <i>(${(new Date(opinion.vytvorene)).toDateString()})</i></h3>
    //    <p>${opinion.comment}</p>
    // </section>`;
    // return opinionTemplate;


    //
    // opinion.createdDate=(new Date(opinion.vytvorene)).toDateString();
    //
    //
    // const template = document.getElementById("mTmplOneOpinion").innerHTML;
    // const htmlWOp = Mustache.render(template,opinion);
    //
    // delete(opinion.createdDate);
    //
    //
    // return htmlWOp;

    const opinionView ={
        name: opinion.name,
        comment: opinion.comment,
        createdDate: (new Date(opinion.vytvorene)).toDateString(),

    };

    const template = document.getElementById("mTmplOneOpinion").innerHTML;
    return htmlWOp = Mustache.render(template,opinionView);


}

function opinionArray2html(sourceData){
    return sourceData.reduce((htmlWithOpinions,opn) => htmlWithOpinions+ opinion2html(opn),"");
}

let opinions=[];

const opinionsElm=document.getElementById("opinionsContainer");









let myFrmElm=document.getElementById("opnFrm");

myFrmElm.addEventListener
("submit",processOpnFrmData);

function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const name = document.getElementById("fname").value.trim();
    const emial = document.getElementById("femail").value.trim();
    const opinion = document.getElementById("fcontent").value.trim();

    const playingsport = document.getElementById("yes").checked;


    const bedminton = document.getElementById("bed").checked;
    const stolnytenis = document.getElementById("ping").checked;
    const tenis = document.getElementById("tenis").checked;



    //3. Verify the data
    if(name=="" || opinion=="" ){
        window.alert("ProsÃ­m vyplÅ najprv Ãºdaje o sebe.");
        return;
    }

    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: name,
            comment: opinion,
            emial: emial,
            hrava: playingsport,
            bedminton: bedminton,
            tenis:tenis,
            stolnytenis:stolnytenis,
            vytvorene: new Date()
        };


    if(localStorage.myComments){
        opinions=JSON.parse(localStorage.myComments);
    }

    opinionsElm.innerHTML=opinionArray2html(opinions);

    console.log("New opinion:\n "+JSON.stringify(newOpinion));

    opinions.push(newOpinion);

    localStorage.myComments = JSON.stringify(opinions);


    //4. Notify the user
    window.alert("Äakujem za tvoju referenciu.Tvoja referencia bola uloÅ¾enÃ¡.");
    //  console.log("New opinion added");
    // console.log(opinions);
    opinionsElm.innerHTML+=opinion2html(newOpinion);

    //5. Reset the form
    myFrmElm.reset(); //resets the form

    //5. Go to the opinions
    window.location.hash="#opinions";

}
