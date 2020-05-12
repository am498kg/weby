
  export default[



    {
        //the part after '#' in the url (so-called fragment):
        hash:"home",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-title").innerHTML
    },

        {
            hash:"opinions",
            target:"router-view",
            getTemplate: storeOpinions
        },

    {
       hash:"addopinions",
       target:"router-view",
       getTemplate:(targetElm) =>{
           document.getElementById(targetElm).innerHTML = document.getElementById("add-title").innerHTML;
       console.log("clicaddopinions");
       }
    },

      {
          hash:"articles",
          target:"router-view",
          getTemplate:fetchAndDisplayArticles

      },

      {
          hash: "articles",
          target: "router-view",
          getTemplate: createHtml4Main

      },

      {
          hash:"article",
          target:"router-view",
          getTemplate: fetchAndDisplayArticleDetail
      },

      {
          hash:"artEdit",
          target:"router-view",
          getTemplate: editArticle
      }

  ];




  function storeOpinions(targetElm) {

      const opinionsFromStorage = localStorage.myComments;
      let opinions = [];

      if (opinionsFromStorage) {
          opinions = JSON.parse(opinionsFromStorage);
          opinions.forEach(opinion => {
              opinion.created = (new Date(opinion.created)).toDateString();

          });
      }



      document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById("opinions-title").innerHTML,
          opinions,
      console.log("seeopinion")
      );

  }


  function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash){

      const offset=Number(offsetFromHash);
      const totalCount=Number(totalCountFromHash);

      let urlQuery = "";

      if (offset && totalCount){
          urlQuery=`?offset=${offset}&max=${articlesPerPage}`;
      }else{
          urlQuery=`?max=${articlesPerPage}`;
      }

      const url = `${urlBase}/article${urlQuery}`;

      fetch(url)
          .then(response =>{
              if(response.ok){
                  return response.json();
              }else{ //if we get server error
                  return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
              }
          })
          .then(responseJSON => {
              addArtDetailLink2ResponseJson(responseJSON);
              document.getElementById(targetElm).innerHTML =
                  Mustache.render(
                      document.getElementById("template-articles").innerHTML,
                      responseJSON
                  );
          })
          .catch (error => { ////here we process all the failed promises
              const errMsgObj = {errMessage:error};
              document.getElementById(targetElm).innerHTML =
                  Mustache.render(
                      document.getElementById("template-articles-error").innerHTML,
                      errMsgObj
                  );
          });
  }

  /*

    function fetchAndDisplayArticles(targetElm){
        const url = "https://wt.kpi.fei.tuke.sk/api/article";

        fetch(url + "/?max=20&offset=0")
            .then(response =>{
                if(response.ok){
                    return response.json();
                }else{ //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })
            .then(responseJSON => {
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles").innerHTML,
                        responseJSON
                    );

            })
            .catch (error => { ////here we process all the failed promises
                const errMsgObj = {errMessage:error};
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            });

    }

  */
  function createHtml4Main(targetElm, current,totalCount) {

      current = parseInt(current);
      totalCount = parseInt(totalCount);
      const data4rendering = {
          currPage: current,
          pageCount: totalCount
      };


      if (current > 1) {
          data4rendering.prevPage = current - 1;
      }

      if (current < totalCount) {
          data4rendering.nextPage = current + 1;
      }

      document.getElementById(targetElm).innerHTML = Mustache.render(
          document.getElementById("template-main").innerHTML,
          data4rendering
      );
  }


  const urlBase = "https://wt.kpi.fei.tuke.sk/api";
  const articlesPerPage = 20;

  function addArtDetailLink2ResponseJson(responseJSON){
      responseJSON.articles =
          responseJSON.articles.map(
              article =>(
                  {
                      ...article,
                      detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
                  }
              )
          );
  }


  function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
      fetchAndProcessArticle(...arguments,false);
  }


  /**
   * Gets an article record from a server and processes it to html according to the value of the forEdit parameter.
   * Assumes existence of the urlBase global variable with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
   * availability of the Mustache.render() function and Mustache templates with id="template-article" (if forEdit=false)
   * and id="template-article-form" (if forEdit=true).
   * @param targetElm - id of the element to which the acquired article record will be rendered using the corresponding template
   * @param artIdFromHash - id of the article to be acquired
   * @param offsetFromHash - current offset of the article list display to which the user should return
   * @param totalCountFromHash - total number of articles on the server
   * @param forEdit - if false, the function renders the article to HTML using the template-article for display.
   *                  If true, it renders using template-article-form for editing.
   */
  function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,forEdit) {
      const url = `${urlBase}/article/${artIdFromHash}`;

      fetch(url)
          .then(response =>{
              if(response.ok){
                  return response.json();
              }else{ //if we get server error
                  return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
              }
          })
          .then(responseJSON => {


              if(forEdit){
                  responseJSON.formTitle="Article Edit";
                  responseJSON.formSubmitCall =
                      `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                  responseJSON.submitBtTitle="Save article";
                  responseJSON.urlBase=urlBase;

                  responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

                  document.getElementById(targetElm).innerHTML =
                      Mustache.render(
                          document.getElementById("template-article-form").innerHTML,
                          responseJSON
                      );
              }else{

                  responseJSON.backLink=`#articles/${offsetFromHash}/${totalCountFromHash}`;
                  responseJSON.editLink=`#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                  responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                  document.getElementById(targetElm).innerHTML =
                      Mustache.render(
                          document.getElementById("template-article").innerHTML,
                          responseJSON
                      );
              }

          })
          .catch (error => { ////here we process all the failed promises
              const errMsgObj = {errMessage:error};
              document.getElementById(targetElm).innerHTML =
                  Mustache.render(
                      document.getElementById("template-articles-error").innerHTML,
                      errMsgObj
                  );
          });

  }

  function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
      fetchAndProcessArticle(...arguments,true);
  }


  /*

    const articlesElm = document.getElementById("articles");
    const errorElm = document.getElementById("error");


    function fetchAndDisplayArticles(targetElm) {
        let articleList = [];
        const serverUrl = "http://wt.kpi.fei.tuke.sk/api/article";


        fetch(serverUrl + "/?max=20&offset=0")
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else { //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })



            .then(responseJSON => {
                console.log(responseJSON);
                articleList = responseJSON.articles;
                return Promise.resolve();
            })
            .then(() => {
                let cntRequests = articleList.map(
                    article => fetch(`${serverUrl}/${article.id}`)
                );
                return Promise.all(cntRequests);
            })
            .then(responses => {
                let failed = "";
                for (let response of responses) {
                    if (!response.ok) failed += response.url + " ";
                }
                if (failed === "") {
                    return responses;
                } else {
                    return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
                }
            })

            .then(responses => Promise.all(responses.map(resp => resp.json())))
            .then(articles => {
                articles.forEach((article, index) => {
                    articleList[index].content = article.content;
                });

                return Promise.resolve();
            })

            .then(() => {
                renderArticles(articleList);
            })


            .catch(error => { ////here we process all the failed promises
                const errMsgObj = {errMessage: error};
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            });

        function renderArticles(articles) {
            articlesElm.innerHTML=Mustache.render(document.getElementById("mtemplate").innerHTML, articles); //write some of the response object content to the page using Mustache
        }

        /*
            .catch(error => errorHandler && errorHandler(error));

       /* const errMsgObj = {errMessage:error};
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );



    }
    function errorHandler(error) {
        if (errorElm)
        errorElm.innerHTML=`Error reading data from the server. ${error}`; //write an error message to the page
    }

    function renderArticles(articles) {
        articlesElm.innerHTML=Mustache.render(document.getElementById("mtemplate").innerHTML, articles); //write some of the response object content to the page using Mustache
    }




  }


  */
