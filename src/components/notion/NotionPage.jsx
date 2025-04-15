import React, { useEffect } from 'react';

const NotionPage = ({ recordMap }) => {
    useEffect(() => {
        document.querySelectorAll('.notion-spacer').forEach(el => {
            el.innerHTML = el.innerHTML.replace(/\n/g, '<br/>');
        });
    }, [recordMap]);

    return (
        <div className="notion">
            <div dangerouslySetInnerHTML={{ __html: recordMap }}/>
        </div>
    );
};

export default NotionPage;
