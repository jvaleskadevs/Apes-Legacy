const CustomButton = ({ btnType, title, handleClick, styles }) => {
  return (
    <button
      type={btnType}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton;
